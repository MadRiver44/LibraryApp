// we require our node modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

// we require our modules from our routes folder/directory
// these modules handle ourroutes/url paths
var index = require('./routes/index');
var users = require('./routes/users');
var catalog = require('./routes/catalog'); // import routes for catalog
var compression = require('compression');
var helmet = require('helmet');

// last thing we do after requireing all our modules is create the express object
var app = express();
app.use(helmet());

// use mongoose to connect to mongo
var mongoose = require('mongoose');
var dev_db_url = 'mongodb://the_library_app:node996@ds135966.mlab.com:35966/library_app';
var mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB, {
  useMongoClient: true,
});
mongoose.Promise = global.Promise;
// now with the above connection, we need to get notified if we connect successfully or if an error occurs
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));
//db.once('open', function() {
//console.log("We're connected!!");
//});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Now we set up our middleware libraries to the request handling chain
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); //expressValidator uses the bodyParser middlewre to access parameters, must be right after bP
app.use(cookieParser());
app.use(compression()); // compress all routes;
app.use(express.static(path.join(__dirname, 'public')));

//we add route handling code to request handling chain
app.use('/', index); // look in index file (that we imported on line 12)
app.use('/users', users); // look in index file (that we imported on line 13)
app.use('/catalog', catalog); // Add catalog to middleware chain

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
