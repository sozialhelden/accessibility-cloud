// Setup Node dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var settings = require('../converter/converter').GetSettings();
//var routes = require('./routes/index');
//var users = require('./routes/users');

// Start express Web-Server
var app = express();
var router = express.Router();

// View engine setup
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


//--- Routes -------------------------------------------
router.get('/', function(req, res, next) {
  res.render('startpage', 
    {
      country_count: _countries_count, 
      place_count: _place_count, 
      source_count: Object.keys(_sources).length 
    });
});

router.get('/sources/:source_id', function(req, res, next) 
{
  let source_id = req.params.source_id;

  res.render('sources/view', 
    { 
      bla: ["red", "green", "blue"],
      source_id: source_id,
      source_status: _sources[source_id]
    });
});

router.get('/sources', function(req, res, next) {
  console.log(_sources);
  res.render('sources/index', 
    { 
      bla: ["red", "green", "blue"],
      sources: _sources
    });
});


router.get('/test', function(req, res, next) {
  res.render('test', 
    { 
      bla: ["red", "green", "blue"]
    });
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
_sources = {};
_place_count = 0;
_countries_count = 0;

function read_status() {
    let fs = require('fs');

    // Try parsing latest status-object
    try {
        var status = JSON.parse(fs.readFileSync(settings.output_directory + 'status.json'));
    } 
    catch(err) {
        console.log('No status from manage (yet), retrying in 30min');
        return;
    }
    _sources = status;

    // Count number of entries...
    _place_count = 0;

    let country_set = {};
    for (let source_id in _sources) {
        try {
          a_source = _sources[source_id];          
          a_source.source_id = source_id;    // useful for generating links 
          _place_count += a_source.data_sets.reverse()[0];
          country_set[a_source.source.properties.country] = true;          
        } 
        catch(e) {console.log(e);
      }; 
    }
    _countries_count = Object.keys(country_set).length;
}

// Refresh status every half hour
read_status();
setInterval(read_status, 30 * 60 * 1000)

module.exports = app;
