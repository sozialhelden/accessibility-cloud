
var Converter = require('../converter/converter');
var settings = Converter.GetSettings();
var fs = require('fs');
var log = require('winston');
log.add(log.transports.File, {
    filename: settings.log_directory + 'M-logs.log',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    exitOnError: false
   // timestamp: function() {return (new Date()).toISOString()}
  });
log.info("M Started");
//log.handleExceptions(new winston.transports.File({ filename: 'M-exceptions.log' }))

assert = require('assert');

var M = module.exports = function(status_file) {
    if (!status_file)
        status_file = settings.output_directory + 'status.json';
    try {
        this.status = JSON.parse(fs.readFileSync(status_file, 'utf8'), JSON.dateParser );
    } catch(err) {
        log.warn("File " + status_file + " not found. Possible first start?");
        this.status = {}
    }
    Object.defineProperty(this.status, 'save', {value: function() {
        fs.writeFile(status_file, JSON.stringify(this), 'utf8', (err)=>{/* don't care */});
    }});    // Same as this.status.save = function()... but hides from iterator and makes it untouchable
    this.grand_result = {}; // will contain all entries.
    this._n = 0;    // triggers write global
    this.settings = settings;
}

M.prototype.writeGlobal = function() {
    log.profile("Converting all sources");
    log.profile("Writing result.json");
    let out_str = "{\n";
    for (let key in this.grand_result) 
        out_str += '"' + key + '" : ' + JSON.stringify(this.grand_result[key]) + ',\n';
    out_str += "}\n";
    fs.writeFileSync(settings.output_directory + "result.json", out_str);
    log.profile("Writing result.json");
};

M.prototype.refresh = function() {
    // Check current sources
    var source_names = Converter.GetSourceList();
    for (var name of source_names)
        if (!this.status[name]) {
            log.info('Managing new source ' + name);
            this.status[name] = {
                added                   : new Date(), // ...
                last_run                : null, // time of last run()
                last_successful_run     : null, // ...
                last_unsuccessful_run   : null, // ...
                data_sets               : [],   // number of retrieved data sets including history
                last_log_file           : null, // log file of last run (successful or not)
                last_failed_log_file    : null, // log file of last unsuccessful run 
                sample                  : null, // the sample obj of converter
                timer                   : null, // the timer object if scheduled
                running                 : false
            };
            Object.defineProperty(this.status[name], 'timer', {enumerable: false, writable: true}); // prevents JSON.stringify to store
        }
    this.status.save();
    this.n_entries = Object.keys(this.status).length;
}

M.prototype.run_single_source = function(source_name) {
    assert(this.status[source_name], 'Not managing source ' + source_name);
    var status = this.status[source_name];
    try {
        var source = status.source = Converter.GetSourceDescription(source_name);
    } catch(err) {
        log.error('Source ' + source_name + ' contains errors: ' + err);
        delete status[source_name];
        this.status.save();
        return;        
    }
    if (source.not_found) {
        log.error('Source or a template vanished: ' + source.not_found);
        delete status[source_name];
        status.save();
        return;
    }
    try {
        var converter = require('../converter/' + source.converter)(source_name);
    } catch(err) {
        log.error('Source ' + source_name + ' contains errors: ' + err);
        log.error('Problems loading source.converter = ' + source.converter);
        delete status[source_name];
        this.status.save();
        return;                
    }
    var timeout = setTimeout(()=>{
        converter.emitter.emit('error', 'Timeout.');
    }, 1000 * 60 * 10); // consider failed after 10min
    status.last_run = new Date();
    this._n++;
    converter.emitter.on('error', (err)=>{
        clearTimeout(timeout);
        status.last_unsuccessful_run = new Date();
        status.last_log_file = converter.log_file;
        status.last_failed_log_file = converter.log_file;
        status.running = false;
        this.status.save();
        if (--this._n === 0) // last one finishing
            this.writeGlobal();

    });
    
    converter.emitter.on('ready', ()=>{
        clearTimeout(timeout);
        status.last_successful_run = new Date();
        status.data_sets.push(converter.result.length);
        status.last_log_file = converter.log_file;
        status.sample = converter.sample;
        status.running = false;
        this.status.save();
        // Fill result
        for (var entry of converter.result) 
            this.grand_result[entry.Id] = [entry.Accessible, entry.Name, entry.Address, entry.Longitude, entry.Latitude, source_name];

        if (--this._n === 0) // last one finishing
            this.writeGlobal();
    }); 
    status.running = true;
    log.info('Running ' + source_name + ', log file: ' + converter.log_file);

    converter.run();
    if (Number.isFinite(source.refresh) && source.refresh > 0) {
        log.info("Scheduling refresh for " + source_name + " in " + source.refresh + "hrs.");
        status.timer = setTimeout(()=>{
            this.run_single_source(source_name);
        }, 1000 * 60 * 60 * source.refresh);
        Object.defineProperty(status, 'timer', {enumerable: false, writable: true}); // prevents JSON.stringify to store
    }
}

M.prototype.run_all = function() {
    log.profile("Converting all sources");
    for (var name in this.status) 
        this.run_single_source(name);
}

// Teach JSON how to convert its own date from string back to Date() obj 
JSON.dateParser = function (key, value) {
    if (typeof value === 'string') {
        var regISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        if (regISO.exec(value))
            return new Date(value);
    }
    return value;
};


