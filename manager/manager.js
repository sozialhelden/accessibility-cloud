
var Converter = require('../converter/converter.js');
var fs = require('fs');
var log = require('winston');
log.add(log.transports.File, {
    filename: 'M-logs.log',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    exitOnError: false,
    timestamp: function() {return (new Date()).toISOString()}
  });
log.info("M Started");

assert = require('assert');

var M = module.exports = function() {
    try {
        this.status = JSON.parse(fs.readFileSync('status.json', 'utf8') );
    } catch(err) {
        log.warn("No status.json found. First start?");
        this.status = {}
    }
    // Check current sources
    var source_names = Converter.GetSourceList();
    for (var name of source_names)
        if (!this.status[name]) {
            log.info('Managing new source ' + name);
            this.status[name] = {
                last_refresh            : null, // time of last invoke (if source data did not change, run is not called)
                last_run                : null, // time of last run()
                last_successful_run     : null,
                last_unsuccessful_run   : null,
                data_sets               : [0],  // number of retrieved data sets including history
                last_log_file           : null, // log file of last run (successful or not)
                last_failed_log_file    : null, // log file of last unsuccessful run 
                sample                  : null  // the sample obj of converter
            }
        }
}

M.prototype.run = function(source_name) {
    assert(this.status[name], 'Not managing source ' + source_name);
    var source = Converter.GetSourceDescription(source_name);
    var convert = require('../converter/' + source.converter + '.js');
    
}