module.exports = function(app, passport, mongoose, calculatePrivacyScore) {

  const TestResult = require('./models/testResult');
  const ScanHistory = require('./models/ScanHistory');

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================

    app.get('/profile', isLoggedIn, calculatePrivacyScore, async (req, res) => {
        const userId = req.user._id;
        
        try {

            const scans = await ScanHistory.find({ owner: userId }); // Grabs all of the scans
            const scan = scans.length > 0 ? scans[0] : null;; // Able to grab a scan at a time

            console.log('Scan being passed to the template from /profile:', scan);


            const testResult = await TestResult.findOne({ userId });

            const renderData = { 
                    user: req.user, 
                    scans: scans, 
                    scan: scan, 
                    results: [], 
                    userId: userId, 
                    testResult: testResult ,
                    finalScore: res.locals.finalScore,
                    status: res.locals.status,
                    description: res.locals.description 
                };
            

            console.log('Profile data being passed to EJS:', renderData);

            if (testResult) {
                renderData.testResult = testResult;
            }

            res.render('profile', renderData);
        } catch (err) {
            console.error('Error fetching test result:', err);
            res.status(500).send('Error fetching required profile data');
        }
    });

    
    

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });




    








// test routes ===============================================================

app.get('/test', isLoggedIn, async (req, res) => {
    try {
        const results = await TestResult.find({}).limit(1) // Limit to 1 document
        const result = results.length > 0 ? results[0] : null; // Getting the first result or null if nothingg found

        res.render('test.ejs', {
            userId: req.user,
            testResult: result
        });
    } catch (err) {
        console.error('Error fetching test result:', err);
        res.status(500).send("An error occurred while fetching the result.");
    }
});



  function calculateScore(answers) {
    console.log(answers) // this returns an object
    const correctAnswers = ['A', 'C', 'A', 'B', 'B']; // these are the correct answers
    let score = 0;

    // Converting answers object to an array of values
    const answersArray = Object.values(answers);
    
    // Comparing each answer with the correct one
    answersArray.forEach((answer, index) => {
        if (answer === correctAnswers[index]) {
            score++;
        }
    });

    return score;
}

  

// Submit test answers get the calculate score
app.post('/submitTest', isLoggedIn, async (req, res) => {
    const userId = req.user._id; 

    const answers = req.body; 

    const score = calculateScore(answers);

    const newTestResult = new TestResult({
        userId: userId,
        score: score,
        answers: [answers.q1, answers.q2, answers.q3, answers.q4, answers.q5], // Storig the answers array in the document
        dateTaken: new Date()
    });

    newTestResult.save()
        .then(() => {
        res.redirect('/profile');
        })
        .catch(err => {
        console.error('Error saving test result:', err);
        res.status(500).send('Error saving test result');
        });
    });

// redoing the test
app.put('/redoTest/:id', isLoggedIn, calculatePrivacyScore, async (req, res) => {
    const testId = req.params.id;
    const { q1, q2, q3, q4, q5 } = req.body;
    const answers = [q1, q2, q3, q4, q5];
    const Updatedscore = calculateScore(answers);

    try {
        console.log('Request Body:', req.body);
        console.log('Updating test:', { testId, answers, Updatedscore });

        // Checking if document exists before updating
        const existingTest = await TestResult.findById(testId);
        if (!existingTest) {
            return res.status(404).send({ message: "Test result not found." });
        }

        console.log("Document exists!");

        const userId = req.user._id;

        // Fetch scan history for the user
        const scans = await ScanHistory.find({ owner: userId });
        if (!scans || scans.length === 0) {
            return res.status(404).send({ message: "No scan history found for this user." });
        }

        console.log("Scans found:", scans);

        // get the scanId from the first scan
        const scanId = scans[0]._id;

        // Fetch the specific scan document
        const scan = await ScanHistory.findById(scanId);
        if (!scan) {
            return res.status(404).send({ message: "Scan not found." });
        }

        console.log("Scan found:", scan);
        

        const result = await TestResult.updateOne(
            { _id: testId },
            {
                $set: {
                    answers: answers, // Directly use the answers array
                    userId: mongoose.Types.ObjectId(userId), // Making suree userId is an ObjectId
                    score: Updatedscore,
                    dateTaken: new Date() // Using current date
                }
            }
        );

        console.log('Update result:', result); 

        if (result.nModified === 0) {
            console.error(`No documents matched the query or document already up-to-date`);
            return res.status(404).send({ message: 'Test result not found or no changes made.' });
        }

        console.log('Test updated successfully!');
        const updatedTestResult = await TestResult.findById(testId);

        console.log('Updated Test Result:', updatedTestResult);
        
        res.render('profile', {
            user: req.user, 
            testResult: updatedTestResult,
            userId: userId,
            scan: scan,
            scans: scans,
            results: scan.results,
            finalScore: res.locals.finalScore,
            status: res.locals.status,
            description: res.locals.description
        });
    } catch (error) {
        console.error("Error updating test:", error);
        res.status(500).send({ message: "Error updating test" });
    }
});



app.delete('/deleteTest/:id', (req, res) => {
    const testId = req.params.id;
    console.log('Test result ID:', testId)

    TestResult.findByIdAndDelete(testId, (err, result) => {
        if (err) return res.status(500).send({ message: "Error deleting test" });
        if (!result) return res.status(404).send({ message: "Test not found" });
        res.redirect('/profile');
    });
});





















// email leak scan routes ===============================================================

app.post('/save-scan', async (req, res) => {
    const { query, sources } = req.body;
    const userId = req.user.id; // Grabbing the user ID to link the scans to the user

    // Have to map API data to the schema format because I got an error before saying it was unformatted
    const formattedResults = sources.map(source => ({
        sourceName: source.name,
        sourceDate: source.date,
    }));

    // Generating the searchId with "Email:" or "Username:" at the beginningg
    const searchId = query.includes('@') && query.includes('.com') ? `Email: ${query}` : `Username: ${query}`;

    try {
        // Checking to see if a scan with the same query already exists
        let scan = await ScanHistory.findOne({ query, owner: userId });

        if (!scan) {
            // Iff a scann does not exist then create a new scan
            scan = new ScanHistory({
                query,
                searchId,
                results: formattedResults,
                owner: userId,
            });
            await scan.save();

            return res.json({
                message: 'Scan saved successfully',
                data: scan,
                userId,
            });
        } else {
            // If the scan already exists, return the existing scan
            return res.json({
                message: 'Scan already exists',
                data: scan,
            });
        }
    } catch (error) {
        console.error('Error in /save-scan:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

  
  // Route to get all scans for the logged-in user
  app.get('/scan-history', async (req, res) => {
    console.log('User:', req.user); 
  
    if (!req.user) {
      return res.redirect('/login');
    }
  
    const userId = req.user.id;
    console.log('User ID:', userId);
  
    try {
      const scans = await ScanHistory.find({ owner: userId });
        console.log('Scans fetched for user:', scans);

        // Send scans as JSON to the client-side JS
        res.json(scans);
    } catch (error) {
      console.error('Error fetching scan history:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  // Route to delete a scan from the database
  app.delete('/delete-scan/:id', async (req, res) => {
    try {
      const scanId = req.params.id;
      const scan = await ScanHistory.findByIdAndDelete(scanId);
  
      if (!scan) {
        return res.status(404).send('Scan not found');
      }
  
      res.json({ message: 'Scan deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


  








  ////////// Display scan results
  app.get('/scan-results/:scanId', calculatePrivacyScore, async (req, res) => {
    const { scanId } = req.params;
    const userId = req.user.id;
  
    try {
      // Fetching the scann data from the database using the scanId
      const scan = await ScanHistory.findById({ _id: scanId, owner: userId });
      console.log('Scan data that will be passed via the GET /scan-results/:scanId route to the client-side JS:', scan);
      
      if (!scan) {
        console.error('Scan not found for scanId:', scanId);
        return res.status(404).send('Scan not found');
      }

      const testResult = await TestResult.findOne({ userId }); // including this to avoid the 'testResult is not defined' error after selecting a saved scan
  
      res.render('profile', {
        testResult: testResult || null,
        user: req.user,
        scans: await ScanHistory.find({ owner: userId }), // Refresh scan history to always hae it displayed
        scan, // The selected scan
        results: scan.results, // The results of the selected scan
        userId,
        finalScore: res.locals.finalScore,
        status: res.locals.status,
        description: res.locals.description,
      });
    } catch (error) {
      console.error('Error fetching scan:', error);
      res.status(500).send('Error fetching scan');
    }
  });

  // Deletinng a saved scan
  app.delete('/scan-results/:scanId', async (req, res) => {
    const { scanId } = req.params;

    try {
        const scan = await ScanHistory.findByIdAndDelete(scanId);

        if (!scan) {
            console.error('Scan not found for deletion:', scanId);
            return res.status(404).send('Scan not found');
        }

        res.json({ message: 'Scan deleted successfully', scanId });
    } catch (error) {
        console.error('Error deleting scan:', error);
        res.status(500).send('Error deleting scan');
    }
});

  














  ///////// Adding an action
  app.post('/add-action', calculatePrivacyScore, async (req, res) => {
    const { scanId, sourceName, sourceDate } = req.body;
    const userId = req.user._id;

    try {
       
        const testResult = await TestResult.findOne({ userId });

        const description = `Review email activity for ${sourceName} created on ${sourceDate}`;

        // Find the scan and add the action
        const scan = await ScanHistory.findByIdAndUpdate(
            scanId,
            {
                $push: {
                    actions: {
                        sourceName,
                        sourceDate,
                        description,
                    },
                },
            },
            { new: true } // Return the updated document
        );

        if (!scan) {
            return res.status(404).json({ message: 'Scan not found' });
        }

        console.log('Action added to scan:', scan);

        res.render('profile', {
            testResult: testResult || null,
            user: req.user,
            scans: await ScanHistory.find({ owner: userId }), // Refresh scan history to always hae it displayed
            scan, // The selected scan
            results: scan.results, // The results of the selected scan
            userId,
            finalScore: res.locals.finalScore,
            status: res.locals.status,
            description: res.locals.description,
          });
    } catch (error) {
        console.error('Error adding action:', error);
        res.status(500).json({ message: 'Error adding action', error });
    }
});


  
app.post('/complete-action', async (req, res) => {
    const { scanId, actionId } = req.body;

    try {
        // Removinng the action from the scan's actions array
        const scan = await ScanHistory.findByIdAndUpdate(
            scanId,
            { $pull: { actions: { _id: actionId } } },
            { new: true } // Return the updated document
        );

        if (!scan) {
            return res.status(404).json({ message: 'Scan not found' });
        }

        console.log('Action completed and removed:', actionId);

        res.json({ message: 'Action marked as complete', data: scan });
    } catch (error) {
        console.error('Error completing action:', error);
        res.status(500).json({ message: 'Error completing action', error });
    }
});















/////// Automatically showing IP data
app.get("/api/getData", async (req, res) => {
  const apiUrl = "https://apip.cc/json";
  
  try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error("Failed to fetch data");
      }

      const data = await response.json(); 
      res.json(data); 
  } catch (err) {
      console.error("Error fetching API data: ", err);
      res.status(500).json({ error: "Error fetching data from external API" });
  }
});












// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        }); // User sees the response

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', { // looks in passport file , uses the user model on line 7, then look in user.js file (hash is here, you never want to store passwords in plain text. You always ant to hash it)
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages. Show the user why they failed
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) { 
    if (req.isAuthenticated()) // If authenticated return it
        return next(); // Function built into express

    res.redirect('/'); // If not redirect the user to the homepage
}
