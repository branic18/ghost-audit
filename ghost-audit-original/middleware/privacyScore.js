const mongoose = require('mongoose');
const ScanHistory = require('../app/models/ScanHistory');
const TestResult = require('../app/models/testResult');

const calculatePrivacyScore = async (req, res, next) => {
    if (!req.user) return next(); // Makes sure the user is logged inn

    const userId = req.user._id;

    try {
        // Fetchig scan history and test results
        const scanHistory = await ScanHistory.aggregate([
            { $match: { owner: mongoose.Types.ObjectId(userId) } },
            { $project: { actionsCount: { $size: "$actions" } } },
            { $group: { _id: null, totalActions: { $sum: "$actionsCount" } } }
        ]);
        const actionItemsCount = scanHistory.length > 0 ? scanHistory[0].totalActions : 0;

        const testResult = await TestResult.findOne({ userId }).sort({ dateTaken: -1 });
        const knowledgeTestScore = testResult ? testResult.score : 0;

        // Calculating scores
        const knowledgeScore = (() => {
            switch (knowledgeTestScore) {
                case 5: return 50;
                case 4: return 40;
                case 3: return 30;
                case 2: return 20;
                case 1: return 10;
                case 0: return 0;
                default: return 0; 
            }
        })();

        const emailCheckerScore = (() => {
            if (actionItemsCount === 0) return 50;
            if (actionItemsCount === 1) return 40;
            if (actionItemsCount === 2) return 30;
            if (actionItemsCount === 3) return 20;
            if (actionItemsCount >= 4) return 10;
            return 10; // Default safeguard for email checker sscore
        })();

        const finalScore = knowledgeScore + emailCheckerScore;

        // Determine status and description
        let status = '';
        let description = '';
        if (finalScore === 100) {
            status = 'Secure';
            description = 'You took the necessary actions to secure your digital identity.';
        } else if (finalScore >= 60) {
            status = 'Somewhat Secure';
            description = 'You are on the right track but can improve your security further.';
        } else if (finalScore >= 30) {
            status = 'Below Secure';
            description = 'Your digital identity is vulnerable. Take action to improve it.';
        } else {
            status = 'At Risk';
            description = 'Your digital identity is highly vulnerable. Immediate action is needed.';
        }

        // Attach to res.locals (this makes is accessible in EJS and routes)
        res.locals.finalScore = finalScore;
        res.locals.status = status;
        res.locals.description = description;

        // This helps ppush this code to the next middleware/route
        next();
    } catch (err) {
        console.error('Error calculating privacy score:', err);
        next(); // Letting the executionn continue even if score calculation fails
    }
};

module.exports = calculatePrivacyScore;
