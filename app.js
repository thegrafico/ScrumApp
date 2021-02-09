

// ========== IMPORTS ============
const seedDB = require('./seeds'); // to test the database, create dummy data. 
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectDB = require("./config/db");
const dotenv = require("dotenv");
dotenv.config({path: './config/config.env'});

// ======== ROUTES ===============
const loginRoute          = require('./routes/login');
const dashboardRoute      = require('./routes/dashboard');
const projectDetailRoute  = require("./routes/projectDetail");

// App object 
let app = express();

// connect to database
connectDB();

// only log if we're in development mode
if (process.env.NODE_ENV === "development") app.use(logger('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// create DB data - for testing
// seedDB();

// Loading routes
app.use('/', dashboardRoute);
app.use('/login', loginRoute);
app.use('/dashboard/', projectDetailRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
