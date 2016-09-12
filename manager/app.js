'use strict';

// Generated code by express-generator (default server setup)
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var router = express.Router();
module.exports = app;

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

// -----------------------------------------------------------------------------------------------
// ---------------------- Custom Routes ----------------------------------------------------------
// -----------------------------------------------------------------------------------------------

const winston = require('winston'); // To query log files

var Manager = require('./manager.js');
var manager = new Manager();
manager.refresh();
manager.run_all();

function winston_query(filename, past_hr, callback) {
    try {
    var w = new (winston.Logger)({
            transports: [ new (winston.transports.File)({
                filename: filename
            })]});

    var options = {
        from: new Date - past_hr * 60 * 60 * 1000,
        until: new Date,
        limit: 200,
        start: 0,
        order: 'desc',
    };
    w.query(options, callback);
    } catch(err) {
        setImmediate(()=>{
            callback(err, {})
        })
    }
}

function winston_query_html(filename, past_hr, callback) {
    winston_query(filename,past_hr, function(err, result) {
        var html = '<div style="font-family:monospace">';
        if (err || !result || !result.file) {
            html = "Error retrieving log " + err + "</div>";
            callback(html);
            return;
        }
        var arr = result.file;
        for (var entry of arr) {
            html += '<span style="color:grey;display:inline-block;width:200px">' + (new Date(entry.timestamp).toLocaleString()) + '</span>';
            var color = entry.level == "warn" ? "orange" : entry.level == "error" ? "red" : "green";
            html += '<span style="color:' + color + '">[' + entry.level + ']&nbsp;</span>';
            html += '<span>' + entry.message + '</span>';
            if (entry.durationMs)
                html += '<span style="color:grey"> (' + entry.durationMs + 'ms)&nbsp;</span>';
            html += '<br>'
        }
        callback(html + "</div>");
    });
}

/* GET home page. */
router.get('/status', function(req, res, next) {
    res.json(manager.status);
    //res.render('index', { title: 'Express' });
});
router.get('/', function(req, res, next) {
    var html = '' ;
    var ok_send = function(add_html) { // we don't care for order, just send once all finished.
        html += add_html;
        if (--ok_send.n_calls === 0)
            res.send(html);
    }
    ok_send.n_calls = Object.keys(manager.status).length + 1; // each source log + 1 manager log
    winston_query_html(manager.settings.log_directory + 'M-logs.log', 24 * 10, function(log_html){
        ok_send('<h2>Manager log (Total data-entries: ' + Object.keys(manager.grand_result).length + ', from ' + Object.keys(manager.status).length + ' sources)</h2>' + log_html);
    });
    for (var name in manager.status) {
     //   (()=>{  // need scope for callback to have proper name (xname)
            let xname = name;
            winston_query_html(manager.status[name].last_log_file, 24 * 10 * 100, function(log_html){
                ok_send('<h2>Last converter log for ' + xname + ' (' + new Date(manager.status[xname].last_run).toLocaleString() + ')</h2>' + log_html);
            })
    //    })();
    }

});
router.get('/invoke', function(req, res, next) {
    var s = req.query.name ? req.query.name : "all";
    if (s == "all")
        manager.run_all();
    else
        manger.run_single_source(s);
    res.send("<pre>OK</pre>");
});

router.get('/refresh', function(req, res, next) {
    manager.refresh();
    res.send("<pre>OK</pre>");
});
