/*
This file provides the Converter class, managing a lot standardized stuff that individual converters need. Also writes the output.
Not callable.
*/

if (require.main === module) {
    console.log("Not callable.");
    process.exit(1);
}

var fs = require('fs');
var EE = require('events'); // EventEmitter
var request = require('request');
var winston = require('winston');
var crypto = require('crypto');

var log = winston;


// Simple MD5 string->hex function
function md5(input) {
    return crypto.createHash('MD5').update(input).digest('hex');
}

// The Converter constructor
var C = module.exports = function (converter_name, source_name) {
    this.converter_name = converter_name;
    this.output_file = "ac_out_" + converter_name + "_" + (new Date()).toISOString() + '.json';
    this.sample_file = this.output_file.replace("out", "sample");
    this.log_file = C.GetSettings().log_directory + source_name + "_" + converter_name  + "_" + (new Date()).toISOString() + ".log";
    this.logger = new (winston.Logger)({
        exitOnError: false,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        transports: [
          new (winston.transports.Console)(),
          new (winston.transports.File)({ 
              filename: this.log_file, // rel to current?
              handleExceptions: true,
              humanReadableUnhandledException: true,
              exitOnError : false
            })
        ]
    });
    this.emitter = new EE();
    this.emitter.emittend = this;
    try {
        this.source_description = C.GetSourceDescription(source_name);
    } catch(e) {
        this.logger.error('Failed to obtain source description for ' + source_name);
        setImmediate(()=>{this.emitter.emit('error', 'Problem with opening source. See log.')});
    }
    if (this.source_description.not_found) {
        this.logger.error('Source description ' + source_name + ' or one of the templates could not be found: ' + this.source_description.not_found);
        setImmediate(()=>{this.emitter.emit('error', 'Problem with source. See log.')});
    }

    // compile mappings
    // TODO: use node's VM sandbox to isolate script
    var mapping = {};
    
    for (var key in this.source_description.mappings) {
        try {
            mapping[key] = eval('(row)=>' + this.source_description.mappings[key].replace('{','')); // replace for minimum secruity
        } catch(err) {
            this.logger.error("Illegal script for " + key + ": " + this.source_description.mappings[key] + "\n" + err);        
            setImmediate(()=>{this.emitter.emit('error', 'Problem compiling mappings. See log.')})
        }
    }
    this.source_description.mappings = mapping; // replace the JS string with compiled functions
    
}

C.prototype.provideData = function () {
    // Downloads HTML / reads file
    // TODO implement cache
    if (this.source_description.link.includes('://')) {
        var streamBuffers = require('stream-buffers');
        this.stream_buffer = new streamBuffers.WritableStreamBuffer(); // Download to memory
        this.logger.profile("Download complete ");
        request
            .get(this.source_description.link)
            .on('response', (response)=> {
                this.logger.info('Link status for ' + this.source_description.link + " " + response.headers['content-type'] + ' : ' + response.statusCode); // 200
            })
            .on('error', (err)=>{
                this.logger.error('Download failed: ' + err);
                this.emitter.emit('error', err);
            })
            .on('end', ()=>{
                this.logger.profile("Download complete ");
                try {
                    this.input_data = this.stream_buffer.getContentsAsString(this.source_description.parameters.charset);
                    this.emitter.emit('provideDataFinish');
                } catch(err) {
                    this.logger.error('Something bad happened after download: ' + err);
                    this.emitter.emit('error', err);
                }
            })
            .pipe(this.stream_buffer);
    } else {
        // Use fs to read file
        this.input_data = fs.readFile(C.GetSettings().data_directory + this.source_description.link, this.source_description.parameters.charset, 
            (err, content)=>{
                if (err) {
                    this.logger.error('Could not read static file ' + this.source_description.link);
                    this.emitter.emit('error','No input file');
                } else {
                    this.input_data = content;
                    this.emitter.emit('provideDataFinish');
                }
            });
    }
}

// OVERWRITE: (ASYNC function) Called once before provideRow calls. Gives converter a chance to create an own / internal representation of the data.
// Meant to be overwritten by individual converter.
// Let everybody know you're done by firing 'interpreteFinish' on the emitter or 'error', 'message...' 
C.prototype.interprete = function () {
    this.logger.warn('Default empty Converter.interprete called from ' + this.converter_name);
    setImmediate(()=>{this.emitter.emit('interpreteFinish')});  // Truly asyncs
    // Alternative: Let it fail here
    // this.emitter.emit('error', 'interprete interface called.');
}

// OVERWRITE: (SYNCHRONOUS function) This is called until it returns false. 
// Must return an object with all data keys, so no async calls within. This will become the row object for transforms.
// If no more data is available, return false.
C.prototype.provideRow = function () {
    this.logger.error('Default empty Converter.provideRow called from ' + this.converter_name);
    throw "up";
}

// Provides result / samples by transferring whatever comes out of provideRow into format specified by mapping.
// Results are stored in this.result and this.sample
C.prototype.transfer = function (sampleOnly) {
    this.result = [];
    this.sample = [];
    var count = 0;
    var mapping = this.source_description.mappings;
    var row;
    while (row = this.provideRow()) {
        var set = {
            original: row
        };
        for (key in mapping) {
            set[key] = mapping[key](row);
        }
        if (!set.Id)
            set.Id = md5(JSON.stringify(set));
        this.result.push(set);
        if (count < C.GetSettings().sample_count)
            this.sample.push(set);
        else if (sampleOnly)
            break;
        count++;
    }
}


// initiates call-chain. If sampleOnly is true, chain ends after provideSample.
C.prototype.run = function (sampleOnly) {
    this.logger.profile('Provide Data');
    this.provideData();
    this.emitter.on('provideDataFinish', () => {
        this.logger.profile('Provide Data');
        this.logger.profile('Interprete');
        this.interprete();
    })
    this.emitter.on('interpreteFinish', () => {
        this.logger.profile('Interprete');
        this.logger.profile('Transfer');
        try {
            this.transfer(sampleOnly); // sync call
        } catch(err) {
            this.logger.error('Transfer error: ' + err);
            this.emitter.emit('error', 'Transfer error, see log.');
        }
        this.logger.profile('Transfer');
        this.emitter.emit('ready', this.emittend);
    })
}

C.prototype.storeResult = function () {
    if (!this.result)
        return false;
    fs.writeFileSync(settings.output_directory + this.output_file, JSON.stringify(this.result));
    if (!this.sample)
        return true;
    fs.writeFileSync(settings.output_directory + this.output_file.replace("out", "sample"), JSON.stringify(this.sample, null, 2)); // pretty-printed sample
    return true;
}

// Static method, retrieve settings.json
var settings; //cache for settings
C.GetSettings = function() {
    if (settings)
        return settings;
    try {
        settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    } catch(err) {
        try {
            settings = JSON.parse(fs.readFileSync('converter/settings.json', 'utf8'));
        } catch(err2) { // DEFAULTS
            log.warn('No settings.json, using defaults');
            settings = {
                data_directory      : "data/",
                source_directory    : "sources/",
                output_directory    : "output/",
                log_directory       : "logs/",
                sample_count        : 5
            }
            fs.writeFileSync('settings.json', JSON.stringify(settings,null,2));
        }
    }
    return settings;
}

C.GetSourceList = function() {
    return fs.readdirSync(C.GetSettings().source_directory).
                filter(e=>e.endsWith('json') && !e.startsWith('_')).
                map(e=>e.replace('.json',''));
}

// Name without suffix or path, i.e. 'vienna'
// Handles recursive templating
C.GetSourceDescription = function(name) {
    if (!C.GetSourceList().find(e=>e==name))
        return {not_found : name};
    var stripComments = require('strip-json-comments');
    var source_description = JSON.parse(stripComments(fs.readFileSync(C.GetSettings().source_directory + name + '.json', 'utf8')));
    if (source_description.template) {
        // @TODO: Protect!
        var source_template = C.GetSourceDescription(source_description.template);
        // we have the template object and overwrite / add everything to the original description.
        source_description = extend(true, source_template, source_description);
    }
    return source_description
}

// ------------------------- HELPERS -------------------------------------------------------
// Always a handy tool to merge / copy objects
// jQuery's extend. Attribution: https://github.com/jquery/jquery/blob/master/src/core.js
function extend() {
    var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false,
        toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,
        push = Array.prototype.push,
        slice = Array.prototype.slice,
        trim = String.prototype.trim,
        indexOf = Array.prototype.indexOf,
        class2type = {
            "[object Boolean]": "boolean",
            "[object Number]": "number",
            "[object String]": "string",
            "[object Function]": "function",
            "[object Array]": "array",
            "[object Date]": "date",
            "[object RegExp]": "regexp",
            "[object Object]": "object"
        },
        jQuery = {
            isFunction: function (obj) {
                return jQuery.type(obj) === "function"
            },
            isArray: Array.isArray ||
                function (obj) {
                    return jQuery.type(obj) === "array"
                },
            isWindow: function (obj) {
                return obj != null && obj == obj.window
            },
            isNumeric: function (obj) {
                return !isNaN(parseFloat(obj)) && isFinite(obj)
            },
            type: function (obj) {
                return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
            },
            isPlainObject: function (obj) {
                if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
                    return false
                }
                try {
                    if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                        return false
                    }
                } catch (e) {
                    return false
                }
                var key;
                for (key in obj) {}
                return key === undefined || hasOwn.call(obj, key)
            }
        };
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
    }
    if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {}
    }
    if (length === i) {
        target = this;
        --i;
    }
    for (i; i < length; i++) {
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name];
                copy = options[name];
                if (target === copy) {
                    continue
                }
                if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : []
                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }
                    // WARNING: RECURSION
                    target[name] = extend(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}