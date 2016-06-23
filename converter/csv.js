
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
var csv_parser = require('csv-parse/lib/sync');

var csv = module.exports = function(source_description, sample_only) {
    if (sample_only === undefined)
        sample_only = false;
    
    // GLOBAL FOR DEBUGGING
    var converter = new Converter('csv', source_description)//, sample_only);
    
    converter.interprete = function() {
        try {
            // TODO: use async parser
            this.parsed = csv_parser(this.input_data, this.source_description.parameters);
            assert(Array.isArray(this.parsed), 'CSV result is no array')
            this.csv_row = 0;
            setImmediate(()=>{this.emitter.emit('interpreteFinish')});  // Makes sync call async    
        } catch(err) {
            this.logger.error('CSV Interprete failed: ' + err);
            this.emitter.emit('error', err);
        }
    }
    
    converter.provideRow = function() {
        if (this.csv_row >= this.parsed.length)
            return false;
        return this.parsed[this.csv_row++];
    }
    
    converter.emitter.on('ready', () => {
        converter.logger.info('Finished successfully');
        converter.storeResult(sample_only);
    });
    return converter;
}


if (require.main === module) {
    var sd = process.argv[2];
    var so = process.argv[3] !== undefined;
    console.log("Starting CSV converter with source " + sd + " Sample only: " + so);
    csv(sd,so).run(so); // we don't care for errors here, they will be logged anyway
    
}
