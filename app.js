// ========== IMPORTS ============
const seedDB = require('./seeds'); // to test the database, create dummy data. 
const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./dbSchema/user');
const middleware = require('./middleware/auth');
const NotificationMiddleware = require('./middleware/notification');
const dotenv = require('dotenv');
const flash = require('connect-flash');
const {
	connectDB
} = require('./config/db');

const {
	SPRINT_TIME_PERIOD,
	WORK_ITEM_ICONS,
	WORK_ITEM_RELATIONSHIP
} = require('./dbSchema/Constanst');

dotenv.config({
	path: './config/config.env'
});

// ======== ROUTES ===============
const LoginRoute = require('./routes/login');
const DashboardRoute = require('./routes/dashboard');
const ProjectDetailRoute = require("./routes/statistics");
const BacklogRoute = require("./routes/backlog");
const WorkItemsRoute = require("./routes/work-items");
const SprintRoutes = require("./routes/sprint-route");
const ManageRoute = require("./routes/manage-routes");
const QueriesRoute = require("./routes/queries");

// API ROUTES
const apiProjectRoute = require("./routes/api/api-project");
const apiWorkItemRoute = require("./routes/api/api-work-item");
const apiUser = require("./routes/api/api-user");
const apiSprint = require("./routes/api/api-sprint");
const apiQuery = require("./routes/api/api-query");
const apiNotification = require("./routes/api/api-notification");


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
		maxAge: 1000 * 60 * 60 * 24 * 7
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
			email: email.toLowerCase() // TODO: add the email in lowercase format
		}, function (err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, {
					message: "This user does not exist"
				});
			}
			if (!user.verifyPassword(password)) {
				return done(null, false, {
					message: "Invalid email/password"
				});
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

	res.locals.currentUser = req.user;
	res.locals.favoriteProjects = (req.user || {})["favoriteProjects"] || [];
	res.locals.error = req.flash("error"); //error mesage go red
	res.locals.success = req.flash("success"); //success message go green
	res.locals.SPRINT_TIME_PERIOD = SPRINT_TIME_PERIOD;
	res.locals.WORK_ITEM_RELATIONSHIP = WORK_ITEM_RELATIONSHIP;
	res.locals.workItemType =  WORK_ITEM_ICONS;
	res.locals.sprintDefaultTimePeriod = SPRINT_TIME_PERIOD["Two Weeks"];
	res.locals.userTeam = null;
	res.locals.showCompletedWorkItems = false;
	res.locals.showCreateWorkItemModal = false;

	next();
});

// ==================== ROUTES =================
app.use('/login', LoginRoute);

app.use('/', middleware.isUserLogin, middleware.setUserProjects, NotificationMiddleware.getUserNotifications, DashboardRoute); // main page
app.use('/dashboard/', middleware.isUserLogin, middleware.setUserProjects, NotificationMiddleware.getUserNotifications, ProjectDetailRoute); // Statistiscs
app.use('/dashboard/', middleware.isUserLogin, middleware.setUserProjects, NotificationMiddleware.getUserNotifications, WorkItemsRoute); // Work Item
app.use('/dashboard/', middleware.isUserLogin, middleware.setUserProjects, NotificationMiddleware.getUserNotifications, BacklogRoute); // backlog
app.use('/dashboard/', middleware.isUserLogin, middleware.setUserProjects, NotificationMiddleware.getUserNotifications, SprintRoutes); // sprint
app.use('/dashboard/', middleware.isUserLogin, middleware.setUserProjects, NotificationMiddleware.getUserNotifications, QueriesRoute); // Queries

// MANAGE - routes
app.use('/dashboard/', middleware.isUserLogin, NotificationMiddleware.getUserNotifications, ManageRoute);

// API - Route
app.use('/dashboard/', middleware.isUserLogin, apiProjectRoute); 
app.use('/dashboard/', middleware.isUserLogin, apiWorkItemRoute); 
app.use('/dashboard/', middleware.isUserLogin, apiUser); 
app.use('/dashboard/', middleware.isUserLogin, apiSprint); 
app.use('/dashboard/', middleware.isUserLogin, apiQuery); 
app.use('/dashboard/', middleware.isUserLogin, apiNotification); 


// ==================== ROUTES =================
// catch 404 and forward to error handler
app.use('*',function (req, res, next) {
	res.render("page-not-found");
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
