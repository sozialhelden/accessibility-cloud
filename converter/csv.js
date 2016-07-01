
/*
Converter Interface:
A single function running the converter on a specified source.

Stand-alone mode:
All converters support command-line execution in the form "node <myconverter.js> <source-descr>"
Automatic converter choice: 
function( {
    source : "my_source",  // handles path + extension
    sample_only : [true/]false    
} )

*/



var fs = require('fs');
var Converter = require('./converter.js');
var csv_parser = require('csv-parse');
var assert = require('assert');

var csv = module.exports = function(source_description, sample_only) {
    if (sample_only === undefined)
        sample_only = false;
    
    var converter = new Converter('csv', source_description); // Create standard interface...    
    
    converter.interprete = function() {     // ... and patch it.
        csv_parser(this.input_data, this.source_description.parameters, (err, result)=>{
            if (err || !Array.isArray(result)) {
                this.logger.error('CSV Interprete failed: ' + err?err:"Result no array?");
                this.emitter.emit('error', err);
                return;
            }
            this.csv_row = 0;
            this.parsed = result;
            this.emitter.emit('interpreteFinish');
        });
    };
    
    converter.provideRow = function() {
        if (this.csv_row >= this.parsed.length)
            return false;
        return this.parsed[this.csv_row++];
    }
    return converter;
}


if (require.main === module) 
    console.log('Use run.js for invocation!');
