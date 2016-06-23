var fs = require('fs');
var Converter = require('./converter.js');
var assert = require('assert');

var json = module.exports = function (source_name, sample_only) {
    if (sample_only === undefined)
        sample_only = false;

    // GLOBAL FOR DEBUGGING
    var converter = new Converter('json', source_name) //, sample_only);

    converter.interprete = function () {
        try {
            assert(this.input_data, 'Nothing to interprete');
            this.input_data = JSON.parse(this.input_data);
            var params = this.source_description.parameters;
            // Shift input object until it contains the array we want to iterate
            if (Array.isArray(params.path))
                for (e of params.path)
                    this.input_data = this.input_data[e];
            assert(Array.isArray(this.input_data), 'JSON converter needs array to iterate: ' + this.input_data);
            this.array_counter = 0;
            setImmediate(() => {
                this.emitter.emit('interpreteFinish')
            }); // Makes sync call async
        } catch (err) {
            this.logger.error(err);
            this.emitter.emit('error', err);
        }
    }

    converter.provideRow = function () {
        if (this.array_counter >= this.input_data.length)
            return false;
        return this.input_data[this.array_counter++];
    }

    converter.emitter.on('ready', () => {
        console.log('Finish');
        converter.storeResult(sample_only);
    });
    return converter;
}


if (require.main === module) {
    var sd = process.argv[2];
    var so = process.argv[3] !== undefined;
    //log.info("Starting JSON converter with source " + sd + " Sample only: " + so);
    json(sd, so).run(so);
}
