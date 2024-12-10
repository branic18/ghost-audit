// set up ======================================================================
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080; 
const MongoClient = require('mongodb').MongoClient // ERROR: 
var mongoose = require('mongoose'); // Mongoose is an Object Data Modeling (ODM) library for MongoDB and 
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan'); // Logging
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser'); // See whats coming with req
// var session      = require('express-session'); // Keep logged in session alive - This is for local testing
var session      = require('cookie-session'); // This is to deploy it

var configDB = require('./config/database.js');

// const methodOverride = require('method-override')
// app.use(methodOverride('_method'))

const calculatePrivacyScore = require('./middleware/privacyScore.js');

// Applying this  middleware globally for all routes, so I can use them ad not have to call them over and over
app.use(calculatePrivacyScore);



// configuration ===============================================================
mongoose.connect(configDB.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to Mongoose");
    console.log(mongoose.version);
    require('./app/routes.js')(app, passport, mongoose, calculatePrivacyScore);
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
 // connect to database

require('./config/passport.js')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')) // All static files don't need individual routes for these pieces of content


app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport- this keeps track of whether the user is logged in or not. Once there's a cookie in the browser it keeps the user logged in
app.use(session({ // Keeps us logged in, sets up session
    secret: 'test-session', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session, show messages to user. This is an error message ('Email doesn't exist')


// launch ======================================================================
// app.listen(3333);
// console.log('The magic happens on port ' + 3333);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
