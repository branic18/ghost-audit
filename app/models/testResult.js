const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    answers: {
        type: [String],
        required: true
    }, // This is where I would store the answers
    dateTaken: { 
        type: Date, 
        default: Date.now 
    }},
    { timestamps: true });

const TestResult = mongoose.model('TestResult', testResultSchema);
module.exports = TestResult;

