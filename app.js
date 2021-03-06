// ========== IMPORTS ============
const seedDB          = require('./seeds'); // to test the database, create dummy data. 
const createError     = require('http-errors');
const express         = require('express');
const session         = require('express-session');
const path            = require('path');
const cookieParser    = require('cookie-parser');
const logger          = require('morgan');
const MongoStore      = require('connect-mongo')(session);
const passport        = require('passport');
const LocalStrategy   = require('passport-local');
const User            = require('./dbSchema/user');
const middleware      = require('./middleware/auth');
const dotenv          = require('dotenv');
const flash           = require('connect-flash');
const {connectDB}     = require('./config/db');

const {SPRINT_TIME_PERIOD} = require('./dbSchema/Constanst');

dotenv.config({
  path: './config/config.env'
});

// ======== ROUTES ===============
const loginRoute            = require('./routes/login');
const dashboardRoute        = require('./routes/dashboard');
const projectDetailRoute    = require("./routes/statistics");
const planingBacklogRoute   = require("./routes/planing-backlog");
const planingworkItemRoute  = require("./routes/planing-work-item");
const planingSprintRoute    = require("./routes/planing-sprint-route");
const apiProjectRoute       = require("./routes/api/api-project"); 
const apiWorkItemRoute      = require("./routes/api/api-work-item"); 
const manageRoute           = require("./routes/manage-routes");
 

// App object 
let app = express();

// connect to database
connectDB();

// to store session in mongoose
const sessionStore = new MongoStore({
  url: process.env.MONGO_URI,
  collection: "sessions"
});

// only log if we're in development mode
// if (process.env.NODE_ENV === "development") app.use(logger('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
app.use(require('body-parser').urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));
// setting up session
app.use(session({
  secret: 'My_cat_and_dog_are_the_best_in_the_universe',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  } // one day
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// since the User Schema is using the passport for mongoose, we can use the auth method.
// passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function (email, password, done) {
    User.findOne({
      email: email
    }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// create DB data - for testing
// seedDB();

// middleware to get the username
app.use(function (req, res, next) {

  res.locals.currentUser    = req.user;
	res.locals.error          = req.flash("error"); //error mesage go red
	res.locals.success        = req.flash("success"); //success message go green
  res.locals.SPRINT_TIME_PERIOD = SPRINT_TIME_PERIOD;
  res.locals.sprintDefaultTimePeriod = SPRINT_TIME_PERIOD["Two Weeks"];

  next();
});

// ==================== ROUTES =================
app.use('/login', loginRoute);

app.use('/', middleware.isUserLogin, dashboardRoute); // main page
app.use('/dashboard/', middleware.isUserLogin, projectDetailRoute);   // Statistiscs
app.use('/dashboard/', middleware.isUserLogin, planingworkItemRoute); // Work Item
app.use('/dashboard/', middleware.isUserLogin, planingBacklogRoute);  // backlog
app.use('/dashboard/', middleware.isUserLogin, planingSprintRoute);  // sprint


// API - Route
app.use('/dashboard/', middleware.isUserLogin, apiProjectRoute); // dashboard to show project
app.use('/dashboard/', middleware.isUserLogin, apiWorkItemRoute); // dashboard to show project

// MANAGE - routes
app.use('/dashboard/', middleware.isUserLogin, manageRoute);

// ==================== ROUTES =================
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// <!-- https://bootswatch.com/darkly/ -->