var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();
var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// Routes
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {n_countries: n_countries, n_entries: n_entries, n_sources: Object.keys(manager_status).length });
//  res.render('index', { title: 'Express' });
});


// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//------------------ SERVER LOGIC --------------------------
// check every 30min the status.json from manager
// supposed to be a global var!
manager_status = {};
n_entries = 0;
n_countries = 0;

function read_status() {
    let fs = require('fs');
    try {
        var status = JSON.parse(fs.readFileSync('status.json'));
    } catch(err) {
        console.log('No status from manage (yet), retrying in 30min');
        return;
    }
    manager_status = status;
    // Calc entries
    n_entries = 0;
    let country_set = {};
    for (let source_name in status) {
        try {
        n_entries += status[source_name].data_sets.reverse()[0];
        country_set[status[source_name].source.properties.country] = true;
        } catch(e) {console.log(e)}; // if something goes south in here we don't care
    }
    n_countries = Object.keys(country_set).length;
}

read_status();
setInterval(read_status, 30 * 60 * 1000)

module.exports = app;
