// Setup Node dependencies
var express = require('express');
var exphbs  = require('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var settings = require('../converter/converter').GetSettings();

// Handlebar helpers
var hbs = exphbs.create({
    helpers: {
        toJSON: function(obj) {
            return JSON.stringify(obj, null, 3);
        },
    },
    defaultLayout: 'main',
});


// Start express Web-Server
var app = express();
var router = express.Router();

// View engine setup
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

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


//--- Routes --------------------------------------------------------------
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
            source_id: source_id,
            source_status: _sources[source_id]
        });
});


router.get('/sources/:source_id', function(req, res, next) 
{
    let source_id = req.params.source_id;
    res.render( 'sources/view', 
                { 
                    source_id: source_id,
                    source_status: _sources[source_id]
                });
});


router.get('/sources/:source_id/places', function(req, res, next) 
{
    let matching_places = [['accessible', 'name', 'address', 'lat', 'long', 'source']];
    let source_column_index = 5;
    let source_id = req.params.source_id;
    let MAX_PLACE_COUNT  = 1000;
    
    for( var id in _all_places) {
        var p = _all_places[id];


        if(p[source_column_index] === source_id) {
            matching_places.push(p);

            if(matching_places.length > MAX_PLACE_COUNT)
                break;
        }
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify( matching_places));
});



router.get('/sources', function(req, res, next) {
    res.render('sources/index', 
    { 
        sources: _sources
    });
});



// Development error handler (prints stacktrace)
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production error handler (no stacktraces leaked to user)
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
_all_places = {};


function readData() 
{
    readStatus();
    readResult();
}


function readResult()
{
    let fs = require('fs');

    try {
        var result = JSON.parse(fs.readFileSync(settings.output_directory + 'result.json'));
    } 
    catch(err) {
        console.log('No results from manager (yet), retrying in 30min\n' + err);
        return;
    }
    _all_places = result;
    console.log("number of places:" + _all_places.length);
}


function readStatus() 
{
    let fs = require('fs');

    // Try parsing latest status-object
    try {
            var status = JSON.parse(fs.readFileSync(settings.output_directory + 'status.json'));
    } 
    catch(err) {
        console.log('No status from manager (yet), retrying in 30min');
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

            recomputeSource(a_source);

            _place_count += a_source.data_sets.reverse()[0];
            country_set[a_source.source.properties.country] = true;          
        } 
        catch(e) {
            console.log(e); 
        }; 
    }
    _countries_count = Object.keys(country_set).length;
}


function recomputeSource(source) 
{
    // Compute bounding box
    source.bounding_box = {
        lat_min: 10000,
        lat_max: -10000,
        long_min: 10000,
        long_max: -10000,
    };

    for( let place_index in source.sample) {
        let place = source.sample[place_index];
        if(place.Longitude < source.bounding_box.long_min)
            source.bounding_box.long_min = place.Longitude;

        if(place.Longitude > source.bounding_box.long_max)
            source.bounding_box.long_max = place.Longitude;

        if(place.Latitude < source.bounding_box.lat_min)
            source.bounding_box.lat_min = place.Latitude;

        if(place.Latitude > source.bounding_box.lat_max)
            source.bounding_box.lat_max = place.Latitude;
    }
}


// Refresh status every half hour
readData();
setInterval(readData, 30 * 60 * 1000)

module.exports = app;
