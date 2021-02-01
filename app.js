// create a rolling file logger based on date/time that fires process events
const opts = {
  // errorEventName: 'error',
  logDirectory: 'logs/', // NOTE: folder must exist and be writable...
  fileNamePattern: 'roll-<DATE>.log',
  dateFormat: 'YYYY.MM.DD'
};

// ========== IMPORTS ============
const LOG = require('simple-node-logger').createRollingFileLogger(opts);
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const seedDB = require('./seeds');

// ======== ROUTES ===============
const indexRouter = require('./routes/projects');

// App object 
let app = express();

// connect to the database
mongoose.connect('mongodb://localhost:27017/scrumAppDB', {useNewUrlParser: true, useUnifiedTopology: true}).catch(error => console.log(error));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// create DB data - for testing
seedDB();

// Loading routes
app.use('/', indexRouter);

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
