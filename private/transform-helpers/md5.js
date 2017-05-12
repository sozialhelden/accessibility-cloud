// Copyright (c) 2009-2014 Nikola Klaric.
// https://github.com/nikola/gruft/

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/*!
 * gruft-common module Version 0.2.0
 * Copyright 2009-2014, Nikola Klaric.
 *
 * https://github.com/nikola/gruft
 *
 * Licensed under the MIT License.
 */

/**
 * @namespace gruft.*
 */
;var gruft; if (typeof gruft !== typeof {}) { gruft = {}; }

/**
 * Common library functions. 
 */
gruft.common || ~function (undefined) {

	/**
	 * Housekeeping.
	 */
    var __module__  = "gruft.common",
        __author__  = "Nikola Klaric",
        __version__ = "0.2.0";


    /**
     * Exceptions raised by the gruft library.
     */
    var _exceptions = [
        "InterfaceError" /* Raised when an interface in the gruft.* namespace is used incorrectly. */
      , "FatalError"     /* Raised when an interface is unable to compute correctly. */
      , "IntegrityError" /* Raised when an expected interface in the gruft.* namespace is not available. */
      , "ModuleError"    /* Raised when an interface in the gruft.* namespace is accessed that is not supported. */  
      , "ArgumentError"  /* Raised when a supplied argument is of wrong type or out of range. */ 
      , "AssertionError" /* Raised when an assertion fails. */
    ];


    /**
     * Proxy instances of hash functions.
     */
    var _proxies = {};


    /**
     * Symbol tables for fast conversion.
     */
    var _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        _ALPHANUM = _ALPHA + _ALPHA.toLowerCase() + "0123456789",
        _BASE16_MAP = "0123456789abcdef".split(""),
        _BASE64_CHARSET = _ALPHANUM + "+/=",
        _BASE64_CHARSET_SAFE = _ALPHANUM + "-_",
        _BASE64_MAP = _BASE64_CHARSET.split(""),
        _BASE64_MAP_SAFE = _BASE64_CHARSET_SAFE.split(""),
        _BASE91_MAP = _ALPHANUM + "!#$%&()*+,./:;<=>?@[]^_'{|}~-",
        _BASE91_DICT = {};

        
    /**
     * Helper functions to determine the [[Class]] of an object.
     */
    var _is = new function () {
        var _type = function (object, type) {
            return object != null && toString.call(object).slice(8, -1) === type;
        };
        return {
            Object: function (object) { return _type(object, "Object"); },
            String: function (object) { return _type(object, "String"); },
            Array: function (object) { return _type(object, "Array"); },
            any: function (object) {
                for (var a = 1, type; type = arguments[a]; ++a) {
                    if (_type(object, type)) {
                        return true;
                    }
                }
                return false;
            },
            which: function (object) {
                return object != null ? toString.call(object).slice(8, -1) : "" + undefined;
            },
            instance: function (object) {
                for (var a = 1, type; type = arguments[a]; ++a) {
                    if (type in gruft && object instanceof gruft[type]) {
                        return true;
                    }
                }
                return false;
            }
        };
    }();


    /**
     * Return an iterable object with keys constructed from a supplied argument list, and true-ish values.
     */
    var _dict = function () {
        var head = arguments[0], keys = (_is.Array(head)) ? head : arguments,
            items = {}, token = "gruft.deadbeef";
        for (var k = 0, name; name = keys[k]; ++k) {
            items[name] = token;   
        }
        for (var key in items) {
            if (items[key] !== token) {
                delete items[key];
            }
        }
        return items;
    };


    /**
     * Return an option from a given arguments list if specified, otherwise null.
     */
    var _getOption = function (args, field) {
        return (!!args && field in args) ? args[field] : null;
    };


    /**
     * Parse arguments and set default options.
     * 
     * @exception {gruft.ArgumentError}
     */
    var _parseOptions = function (context, args) {
        var options = {}, message = null, 
            error = "Must supply at least one argument <String message>";
        switch (args.length) {
            case 0:
                throw gruft.ArgumentError(error);
                break;
            case 1:
                if (_is.String(args[0])) {
                    options = _setDefaultOptions(context, {});
                    message = args[0];
                } else if (_is.Object(args[0])) {
                    options = _setDefaultOptions(context, args[0]);
                    message = _getOption(options, "message");
                }
                break;
            case 2: default:
                if (_is.String(args[0]) && _is.Object(args[1])) {
                    options = _setDefaultOptions(context, args[1]);
                    message = args[0];
                }
        }
        if (!_is.String(message)) {
            throw gruft.ArgumentError(error);
        } else {
            options.message = message;    
        }
        return options;
    };


    /**
     * Set default options for digest and encryption implementations.
     */
    var _setDefaultOptions = function (context, options) {
        if (!(_getOption(options, "format") in _dict("hex", "byteseq", "base64", "base64_safe"))) {
            if (_is.instance(context, "MD5", "SHA1", "SHA256", "Tiger192")) {
                options.format = "hex";
            } else if (_is.instance(context, "AES256")) {
                options.format = "base64";
            }
        }
        if (!(_getOption(options, "order") in _dict("little", "big"))) {
            if (_is.instance(context, "MD5", "Tiger192", "AES256")) {
                options.order = "little";
            } else if (_is.instance(context, "SHA1", "SHA256")) {
                options.order = "big";
            }
        }
        return options;
    };
    
    
    /**
     * Return true if type and value of obj1 and obj2 are the same,
     * otherwise raise an exception with details of the discrepancies.
     * 
     * @exception {gruft.AssertionError}
     *          Raised when obj1 and obj1 are not of the same type and value(s).
     */
    var _failUnlessEqual = function (module, obj1, obj2, message, interpolation) {
        if (_is.Array(obj1) && _is.Array(obj2)) {
            if (obj1.length != obj2.length) {
                throw gruft.AssertionError(message + ", <Array obj1> has %2 elements, but <Array obj2> has %3 elements",
                    [interpolation, obj1.length, obj2.length], module);
            }
            for (var index = 0; index < obj1.length; ++index) {
                try {
                    _failUnlessEqual(null, obj1[index], obj2[index]);
                } catch (e) {
                	throw gruft.AssertionError(message + ", <Array obj1> and <Array obj2> are not equal at index %2: %3 !== %4",
                        [interpolation, index, obj1[index].valueOf(), obj2[index].valueOf()], module);
                }
            }
            return true;
        } else if (_is.any(obj1, "Number", "String") && _is.any(obj2, "Number", "String")) {
            if (obj1 !== obj2) {
                throw gruft.AssertionError(message + ", <%2 obj1> is not equal to <%3 obj2>: %4 !== %5",
                    [interpolation, _is.which(obj1), _is.which(obj2), obj1.valueOf(), obj2.valueOf()], module);
            }
            return true;
        } else {
            throw gruft.AssertionError(message + ", <%2 obj1> and <%3 obj2> each must be of type Array, Number or String",
                [interpolation, _is.which(obj1), _is.which(obj2)], module);
        }
    };


    /**
     * Convert a base91-encoded string either to an array of 256 unsigned 32-bit words,
     * or to a string of byte-sized characters.
     */
    var _transformBox = new function () {
        var _nosplit = false;
        try { 
            _nosplit = ("gruft")[0]; 
        } catch (e) { };
        
        var _map = {}, index = 0x5a;
        do { 
            _map[_BASE91_MAP.charAt(index)] = index; 
        } while (index--); 

        return function (source, format) {
            if (!_nosplit) {
                source = source.split("");
            }
            format = format || "byteseq";
                        
            var box = [], word, bits = 0, shift = 0, len = source.length, i = 0, x = -1;
            if (format == "byteseq") { 
                var j = 0xff;
                do { 
                    box[j] = 0; 
                } while (j--);
            }
            
            while (i < len) {
                word = _map[source[i++]] + _map[source[i++]] * 0x5b;
                bits |= word << shift;
                shift += ((word & 0x1fff) > 0x58) ? 0xd : 0xe;
                do {
                    if (format == "byteseq") {
                        box[++x >> 2] |= (bits & 0xff) << ((x % 4) << 3);
                        if (x % 4 == 3) {
                            box[x >> 2] = (box[x >> 2] & 1) + ((box[x >> 2] >>> 1) << 1);
                        }
                    } else {
                        box[++x] = bits & 0xff;
                    }                        
                    shift -= 8;
                    bits >>= 8;
                } while (shift >> 3);
            }    
            
            return (format == "byteseq") ? box : String.fromCharCode.apply(String, box);
        }
    };    


    /**
     * Return a String of 1031 randomly generated byte-sized characters.
     */
    var _getRandomSample = new function () {
        var _random = null;
        return function () {
            if (_random === null) {
                _random = _transformBox("".concat(
                    "a_Y;TC%Tj;J^(5tL;*zByj&d';0qY5[WlBSK<X+('M=,uRdvk}SuCG-vK&_9&!ClX/_QF1>Lbja(VOvAIxX(6pi?ns$2FS$.wy!",
                    "*B~_1S=K%ds0{c5K>fw7i9TpT+?oX_]3Xk}Ub}IE;[%O;wUfcSC#IgP.7meZzf>XFb=*dcGh5^)b4mZPKgaVO7@HJu_]pb6=:bS",
                    "NGtg|pxZ@#!X-9G82k{a/~npX6<5MQ[[%LQ(1(!&7!'@@@,I1)>^F9e)'i9KZ&=TTRK$2K+5Y9-z><NWFrk&^oMVT{hRi%BKe{&",
                    "Ofrt<tgLwd>w*b;bVeSL@7/,skH9l~e{RvOv{54%.K&=:oCL5m&Vh0m/W'$qo1*h(JoQr*;~TQ_IN0p?%TdrHMs{SLRJ!w;6rM!",
                    "HG@4*kJ2*D]rzG>Zt1?1<JxXj_XMCOXX'!nTt0.p*/'a?7e8O7zanTAQsm$(^6M;C[n[4oU82e?r6:ui3=mfp>$6_+OnM{BwU]o",
                    "5E_N(cdZN!T+3zt</!=u~nY<kvy)]oBp%?<beBM%z)WFNZ2Cv9'@zyvw!z1}E2Q^EIS*9oy2Wa<lcooEKt|wHSKU!6GUK3+'nCA",
                    "SL}O##~[ebQuJO.';K4'-nsX661T@TxLr6e,?y#+nN4.=pOkaD%4;!enNnezN9qgsdShO^=|gU'yTWbFkylM6tYmyL_E)tSl1F3",
                    "wNhcWwvVGLTF@dA}JvK?y:NT;7eJWGO}Y|s1+'ZY(*=|lk/YH~Y*9j*pgORhl.QiX^:dmQ_}l4QY$G@1Xwz!oNQ=P47#Ux}DD~P",
                    "X':!a00S2>GyxH<bf6=4Yn1?lbTD<P'8h%z|Df>,&R1uZ6FzmHl?<!riCU41}K-(z:VSIGhxTfSv!RTJ~tMm@M]of?QrGbL_[V9",
                    "jZ%L|t-T~k(uR_[iYL0e28KN%jQ&,(<XkyhKDSi*)?hRNp8EXAj|QrE%WUne}.lO5X%FnYT]kjHW>=g[W}nrcBGLH]4nfHA8dlj",
                    "YYs?|y4+4Jm:;w(:{bZsjz+G]6:cPe?>on4%a5mk@k]1PtjQh[n1h1*^DE:GVOWr<c|^s)m<n._5N$ewRn4}69TbX!tU0fesL0q",
                    "v3?TT7m;B0-Bv8P4+O2SNv.(sWC+,hQ/{C,H+AR7B<ZZhp9<[l*wWoaDrTFGlh?8[:o+NVwrR3RBsHc(#v8Tlm@,@!}kc]je|rD",
                    "T@hVPsSQmK=}!5GUW~8D;VWo?P8'voX-09k@Nb#PV@){Xp:TTUXx,;0^)o+V?],<mpiP(9TR8~JruP6W"
                    ), true);            
            }
            return _random;         
        }
    };


    /**
     * Return a test vector identified by the given handle.
     * 
     * @exception {gruft.ArgumentError}
     *          Raised when an unsupported handle or none is supplied.
     */
    var _getTestvector = new function () {
        var _vectors = {};
        return function (handle) {
            if (!handle) {
                throw gruft.ArgumentError("Must supply a <String> as first argument to identify testvector");
            } else if (!(handle in _dict("digest-base64", "digest-span-utf8", "digest-1024x0", "digest-random"))) {
                throw gruft.ArgumentError("Testvector '%s' is not supported by this version of gruft.common", handle);
            } else {
                if (!_vectors[handle]) {
                    var sfc = String.fromCharCode;
                    
                    /* Basic. */
                    _vectors["digest-base64"] = _BASE64_CHARSET;
                    
                    /* 24 % 3 == 0. */
                    _vectors["digest-span-utf8"] = sfc(
                        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x7c, 0x7d, 0x7e, 0x7f, 
                        0x80, 0x81, 0x82, 0x83, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff 
                        );
                    
                    /* 1024 % 3 == 1. */                    
                    _vectors["digest-1024x0"] = new Array(1025).join(sfc(0));
                   
                    /* 1031 % 3 == 2, 1031 is prime. */
                    _vectors["digest-random"] = _getRandomSample();
                }
                return _vectors[handle];
            }
        }
    };


    /**
     * Calculate digest and return the automagically formatted output.
     */
    var _digest = function () {
        /*  Parse arguments and set default options. */
        var options = _parseOptions(this, arguments), format = options.format;

        /* Compute intermediate digest. */
        var type = this.__type__,
            tuple = _proxies[type].__digest__(options.message, options);

        /* Prepare byte-order conversion. */
        var factor = 1, offset = 0;
        if (options.order == "big") { 
            factor = -1, offset = 3; 
        }
        
        /* Convert intermediate digest tuple. */
        var buffer = [], pos = -1, t = tuple.length * 4;
        while (++pos < t) {
            if (format == "hex") {
                buffer.push(_BASE16_MAP[tuple[pos >> 2] >> 8 * (offset + factor * pos % 4) + 4 & 0xf],
                    _BASE16_MAP[tuple[pos >> 2] >> 8 * (offset + factor * pos % 4) & 0xf]);
            } else {
                buffer.push(tuple[pos >> 2] >> 8 * (offset + factor * pos % 4) & 0xff);
            }
        }
        
        /* Convert to the specified format and return the result. */
        if (format == "hex") { 
            return buffer.join("");
        } else if (format in _dict("base64", "base64_safe")) {
            var encoded = [], pos = 0, remainder = buffer.length % 3, b = buffer.length - remainder,
                map = (format == "base64") ? _BASE64_MAP : _BASE64_MAP_SAFE;
            while (pos < b) {
                encoded.push(map[buffer[pos] >> 2], map[(buffer[pos++] & 0x3) << 4 | buffer[pos] >> 4],
                    map[(buffer[pos++] & 0xf) << 2 | buffer[pos] >> 6], map[buffer[pos++] & 0x3f]);
            }
            if (remainder == 1) {
                encoded.push(map[buffer[pos] >> 2], map[(buffer[pos] & 0x3) << 4]);
                if (format == "base64") { 
                    encoded.push(map[64], map[64]); 
                }
            } else if (remainder == 2) {
                encoded.push(map[buffer[pos] >> 2], map[(buffer[pos++] & 0x3) << 4 | buffer[pos] >> 4],
                    map[(buffer[pos] & 0xf) << 2]);
                if (format == "base64") { 
                    encoded.push(map[64]); 
                }
            }
            return encoded.join("");
        } else {
            return buffer;
        }
    };


    /*
     * Export public methods.
     */
    gruft.common = {

        /**
         * Return a proxy instance of the specified prototype.
         * 
         * @exception {gruft.ModuleError}
         *     Raised when an unsupported prototype is supplied. 
         * @exception {gruft.InterfaceError}
         *     Raised when the implementation is instanced incorrectly.
         * @exception {gruft.FatalError}
         *     Raised when the self-test does not pass.
         */
        reflect: function (context, implementation) {
            var module = implementation.prototype.__module__, id = /\w+$/.exec(module)[0];
    
            if (!(id in _dict("MD5", "SHA1", "SHA256", "Tiger192"))) {
                throw gruft.ModuleError("<%s> is not supported by this version of gruft.common", module);
            } else if (!(context instanceof gruft[id])) {
                throw gruft.InterfaceError("<%s> must be instanced with the 'new' operator", module);
            } else {
                /*
                 * Create instance and copy fields.
                 */
                if (!(id in _proxies)) {
                    var Proxy = implementation;
                    _proxies[id] = new Proxy();
                    if ("__init__" in _proxies[id]) {
                        _proxies[id].__init__.call(_proxies[id]);
                    }
                }
                for (var field in _proxies[id]) {
                    if (field in implementation.prototype && !(/^__\w+__$/.test(field))) {
                        context[field] = _proxies[id][field];
                    }
                }
                context.__type__ = id;
    
                /* Set up automagical output formatting. */
                if (_is.instance(context, "MD5", "SHA1", "SHA256", "Tiger192")) {
                    context.digest = _digest;
                    context.__digest__ = function () { 
                        return context.digest.apply(context, arguments); 
                    };
                }
                
                if ("selftest" in context) {
                    try {
                        context.selftest.call(context);
                    } catch (e) {
                        _proxies[id].__digest__ = function() {
                            throw gruft.FatalError("<%s> did not pass self-test, aborting.", module);
                        };    
                        throw e;
                    }
                    
                }
            }
        },


        /**
         * Return a bound function in the given context and with a fixed module argument.
         */
        bind: function (functor, context, module) {
            var slice = Array.prototype.slice;
            return function () {
                return functor.apply(context, [module].concat(slice.apply(arguments, slice.call(arguments, 3))));
            };
        },


        /**
         * Return a string of specified length concatenated from a fixed random sequence
         * of 1031 characters.
         */
        getRandomString: function (len) {
            var sample = _getRandomSample(), slen = sample.length;
            if (len === slen) {
                return sample;
            } else {
                if (len > slen) {
                    sample = new Array(Math.ceil(len / slen) + 1).join(sample);
                }
                return sample.substr(0, len);
            }
        },


        /**
         * Return a test vector identified by the given handle.
         * 
         * @exception {gruft.ArgumentError}
         *      Raised when an unsupported handle is supplied.
         */
        getTestvector: function (handle) {
            return _getTestvector.apply(this, arguments);
        },


        /**
         * Return true if type and value of obj1 and obj2 are the same,
         * otherwise raise an exception with details of the discrepancies.
         * 
         * @exception {gruft.AssertionError}
         *      Raised when obj1 and obj1 are not of the same type and value.
         */
        failUnlessEqual: function (module, obj1, obj2, message, interpolation) {
            return _failUnlessEqual.apply(this, arguments);
        }, 


        /**
         * Clip a Javascript Unicode string to one byte-sized characters.
         */
        clipString: function (source) {
            if (source.length === 0) {
                return "";
            } else {
                var output = [], len = source.length - 1;
                do {
                    output[len] = source.charCodeAt(len) & 0xff;
                } while (len--);
                return String.fromCharCode.apply(String, output);
            }
        },
        
        
        /**
         * Return true if the source string contains characters that are not in ISO 8859-1.
         */
        containsWideCharacters: function (source) {
    		return /[^\u0000-\u00ff]/.test(source);
		},


        /**
         * Convert a Javascript Unicode (UCS-2) string to UTF-8.
         */
		toUtf8: function (source) {
            return unescape(encodeURIComponent(source));
		},
		

        /**
         * Convert a UTF-8 sequence to Javascript Unicode (UCS-2).
         */
		toUnicode: function (source) {
            return decodeURIComponent(escape(source));
		},
		
		
        /**
         * Convert a base91-encoded string either to an array of 256 unsigned 32-bit words,
         * or to a string of byte-sized characters.
         */
        transformBox: function (source, format) {
            return _transformBox.apply(this, arguments);
        }

    };
    

    /**
     * Declare custom exceptions with string interpolation.
     */
    var Exception = function (code, exception) {
        var error = this;
        error.name = exception;
        error.number = code;
        
        /**
         * Decorate exception with additional information, and interpolate message strings.
         */
        return function (message, interpolation, module) {
            message = message || "";
            if (message && interpolation) {
                if (_is.any(interpolation, "String", "Number")) {
                    message = message.replace(/%(s|1)/g, interpolation);    
                } else if (_is.Array(interpolation)) {
                    if (~message.indexOf("%s") && !~message.indexOf("%1")) {
                        message = message.replace("%s", "%1");
                    }
                    message = message.replace(new RegExp("%([1-" + interpolation.length + "])", "g"), function (match, offset) {
                        return (offset > interpolation.length) ? match : interpolation[offset - 1];
                    });                   
                }
            }
            error.message = message;
            var qualified = exception + ": " + message;
            error.description = error.toString = error.valueOf = function () { return qualified; };
            return error;
        };
    };
    
    Exception.prototype = new Error();
    Exception.prototype.constructor = Exception;
    var num = 0;
    for (var exception in _dict(_exceptions)) {
        if (/^[A-Z][a-z]+Error$/.test(exception)) {
            gruft[exception] = new Exception(2 << num++ >> 1, exception);
        }
    }

}();


/*!
 * gruft-md5 module Version 0.2.0
 * Copyright 2009-2014, Nikola Klaric.
 *
 * https://github.com/nikola/gruft
 *
 * Licensed under the MIT License.
 *
 * The MD5 algorithm was designed by Ronald Rivest.
 */

/**
 * @namespace gruft.*
 */
;var gruft; if (typeof gruft !== typeof {}) { gruft = {}; }

/**
 * Factory for producing safe instances.
 */
gruft.MD5 = function () {
    if (typeof gruft.common === typeof gruft && typeof gruft.common.reflect === typeof gruft.MD5) {
        gruft.common.reflect(this, gruft.__MD5__, arguments);
    } else {
        throw "Module <gruft.common> not found";    
    }
};

/**
 * Implementation of MD5 digest function.
 */
gruft.__MD5__ = function() { }; gruft.__MD5__.prototype = {

    __module__  : "gruft.MD5",
    __author__  : "Nikola Klaric",
    __version__ : "0.2.0",

    /**
     * Perform self-test using discrete test vectors.
     * 
     * @exception {gruft.IntegrityError} 
     *          Raised if __digest__() is not a valid function.
     * @exception {gruft.AssertionError} 
     *          Raised if a test vector fails.
     */
    selftest: function () {
        if (typeof this.__digest__ !== typeof this.selftest) {
            throw gruft.IntegrityError("<%s.__digest__> is not callable", this.__module__, "gruft-md5.js");
        }

        var digest = this.__digest__, gc = gruft.common, error = "MD5 digest of test vector %s is erroneous",
            getTestvector = gc.getTestvector, clipString = gc.clipString,
            failUnlessEqual = gc.bind(gc.failUnlessEqual, gc, "gruft-md5.js");

        /* Basic. */
        failUnlessEqual(
            digest(""),
            "d41d8cd98f00b204e9800998ecf8427e",
            error, "(empty string)");
        failUnlessEqual(
            digest(getTestvector("digest-base64")),
            "08e39f7e8b0b62394f040746a17ca1f6",
            error, "{digest-base64}");

        /* 24 chars between 0x00 .. 0x80 .. 0xff. */
        failUnlessEqual(
            digest(getTestvector("digest-span-utf8")),
            "34c4e74c0da5f130dd6f82a30853c996",
            error, "{digest-span-utf8}");

        /* 1024 zeros. */
        failUnlessEqual(
            digest(getTestvector("digest-1024x0")),
            "0f343b0931126a20f133d67c2b018a3b",
            error, "{digest-1024x0}");

        /* 1031 randomly selected (but stable) chars. */
        failUnlessEqual(
            digest(getTestvector("digest-random")),
            "1407ed3b268f077aca21047b335c0133",
            error, "{digest-random}");

        /* Format to byte sequence. */
        failUnlessEqual(
            digest({message:"MD5", format:"byteseq"}),
            [0x7f, 0x13, 0x8a, 0x09, 0x16, 0x9b, 0x25, 0x0e, 0x9d, 0xcb, 0x37, 0x81, 0x40, 0x90, 0x73, 0x78],
            error, "'MD5' (formatted to byte sequence)");

        /* Format to base64. */
        failUnlessEqual(
            digest({message:"ABCDEFGHIJ"}),
            "e86410fa2d6e2634fd8ac5f4b3afe7f3",
            error, "'ABCDEFGHIJ' (formatted to hex string)");
        failUnlessEqual(
            digest({message:"ABCDEFGHIJ", format:"base64"}),
            "6GQQ+i1uJjT9isX0s6/n8w==",
            error, "'ABCDEFGHIJ' (formatted to base64)");
        failUnlessEqual(
            digest("ABCDEFGHIJ", {format:"base64_safe"}),
            "6GQQ-i1uJjT9isX0s6_n8w",
            error, "'ABCDEFGHIJ' (formatted to base64, URL-safe)");
        
        return true;
    },

    /**
     * Compress message to MD5 digest.
     *
     * @param {String} message 
     *          The string to compress. 
     *          
     * @return {Array} 
     *          MD5 digest as a 4-tuple of 32-bit words.
     */
    __digest__: function (message) {
        var bits = message.length << 3, chunks = 16 + ((bits + 64 >>> 9) << 4) - 1,
            x = [], n = 16 + chunks - 1 - 1;
        do {
            x[n] = 0;
        } while (n--);
        for (n = 0; n < bits; n += 8) {
            /* Assumes that only 1 byte wide characters are used. */
            x[n >> 5] |= message.charCodeAt(n / 8) << n % 32;
        }

        /* Apply MD5 padding (big-bit-endian, little-byte-endian, left-justified). */
        x[bits >> 5] |= 0x80 << bits % 32;
        x[chunks - 1] = bits;

        var u = 0, x00, x01, x02, x03, x04, x05, x06, x07, x08, x09, x10, x11, x12, x13, x14, x15,
            a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476, e, tmpa, tmpb, tmpc, tmpd;
        /* Compress message in 512-bit chunks. */
        while (u < chunks) {
            tmpa = a; tmpb = b; tmpc = c; tmpd = d;

            x00 = x[u++]; x01 = x[u++]; x02 = x[u++]; x03 = x[u++]; x04 = x[u++]; x05 = x[u++]; x06 = x[u++]; x07 = x[u++];
            x08 = x[u++]; x09 = x[u++]; x10 = x[u++]; x11 = x[u++]; x12 = x[u++]; x13 = x[u++]; x14 = x[u++]; x15 = x[u++];

            /* Round 1. */
            e = 0xd76aa478 + x00 + a + (d ^ b & (c ^ d)); a = b + (e <<  7 | e >>> 25);
            e = 0xe8c7b756 + x01 + d + (c ^ a & (b ^ c)); d = a + (e << 12 | e >>> 20);
            e = 0x242070db + x02 + c + (b ^ d & (a ^ b)); c = d + (e << 17 | e >>> 15);
            e = 0xc1bdceee + x03 + b + (a ^ c & (d ^ a)); b = c + (e << 22 | e >>> 10);
            e = 0xf57c0faf + x04 + a + (d ^ b & (c ^ d)); a = b + (e <<  7 | e >>> 25);
            e = 0x4787c62a + x05 + d + (c ^ a & (b ^ c)); d = a + (e << 12 | e >>> 20);
            e = 0xa8304613 + x06 + c + (b ^ d & (a ^ b)); c = d + (e << 17 | e >>> 15);
            e = 0xfd469501 + x07 + b + (a ^ c & (d ^ a)); b = c + (e << 22 | e >>> 10);
            e = 0x698098d8 + x08 + a + (d ^ b & (c ^ d)); a = b + (e <<  7 | e >>> 25);
            e = 0x8b44f7af + x09 + d + (c ^ a & (b ^ c)); d = a + (e << 12 | e >>> 20);
            e = 0xffff5bb1 + x10 + c + (b ^ d & (a ^ b)); c = d + (e << 17 | e >>> 15);
            e = 0x895cd7be + x11 + b + (a ^ c & (d ^ a)); b = c + (e << 22 | e >>> 10);
            e = 0x6b901122 + x12 + a + (d ^ b & (c ^ d)); a = b + (e <<  7 | e >>> 25);
            e = 0xfd987193 + x13 + d + (c ^ a & (b ^ c)); d = a + (e << 12 | e >>> 20);
            e = 0xa679438e + x14 + c + (b ^ d & (a ^ b)); c = d + (e << 17 | e >>> 15);
            e = 0x49b40821 + x15 + b + (a ^ c & (d ^ a)); b = c + (e << 22 | e >>> 10);

            /* Round 2. */
            e = 0xf61e2562 + x01 + a + (c ^ d & (b ^ c)); a = b + (e <<  5 | e >>> 27);
            e = 0xc040b340 + x06 + d + (b ^ c & (a ^ b)); d = a + (e <<  9 | e >>> 23);
            e = 0x265e5a51 + x11 + c + (a ^ b & (d ^ a)); c = d + (e << 14 | e >>> 18);
            e = 0xe9b6c7aa + x00 + b + (d ^ a & (c ^ d)); b = c + (e << 20 | e >>> 12);
            e = 0xd62f105d + x05 + a + (c ^ d & (b ^ c)); a = b + (e <<  5 | e >>> 27);
            e = 0x02441453 + x10 + d + (b ^ c & (a ^ b)); d = a + (e <<  9 | e >>> 23);
            e = 0xd8a1e681 + x15 + c + (a ^ b & (d ^ a)); c = d + (e << 14 | e >>> 18);
            e = 0xe7d3fbc8 + x04 + b + (d ^ a & (c ^ d)); b = c + (e << 20 | e >>> 12);
            e = 0x21e1cde6 + x09 + a + (c ^ d & (b ^ c)); a = b + (e <<  5 | e >>> 27);
            e = 0xc33707d6 + x14 + d + (b ^ c & (a ^ b)); d = a + (e <<  9 | e >>> 23);
            e = 0xf4d50d87 + x03 + c + (a ^ b & (d ^ a)); c = d + (e << 14 | e >>> 18);
            e = 0x455a14ed + x08 + b + (d ^ a & (c ^ d)); b = c + (e << 20 | e >>> 12);
            e = 0xa9e3e905 + x13 + a + (c ^ d & (b ^ c)); a = b + (e <<  5 | e >>> 27);
            e = 0xfcefa3f8 + x02 + d + (b ^ c & (a ^ b)); d = a + (e <<  9 | e >>> 23);
            e = 0x676f02d9 + x07 + c + (a ^ b & (d ^ a)); c = d + (e << 14 | e >>> 18);
            e = 0x8d2a4c8a + x12 + b + (d ^ a & (c ^ d)); b = c + (e << 20 | e >>> 12);

            /* Round 3. */
            e = 0xfffa3942 + x05 + a + (b ^ c ^ d);       a = b + (e <<  4 | e >>> 28);
            e = 0x8771f681 + x08 + d + (a ^ b ^ c);       d = a + (e << 11 | e >>> 21);
            e = 0x6d9d6122 + x11 + c + (d ^ a ^ b);       c = d + (e << 16 | e >>> 16);
            e = 0xfde5380c + x14 + b + (c ^ d ^ a);       b = c + (e << 23 | e >>>  9);
            e = 0xa4beea44 + x01 + a + (b ^ c ^ d);       a = b + (e <<  4 | e >>> 28);
            e = 0x4bdecfa9 + x04 + d + (a ^ b ^ c);       d = a + (e << 11 | e >>> 21);
            e = 0xf6bb4b60 + x07 + c + (d ^ a ^ b);       c = d + (e << 16 | e >>> 16);
            e = 0xbebfbc70 + x10 + b + (c ^ d ^ a);       b = c + (e << 23 | e >>>  9);
            e = 0x289b7ec6 + x13 + a + (b ^ c ^ d);       a = b + (e <<  4 | e >>> 28);
            e = 0xeaa127fa + x00 + d + (a ^ b ^ c);       d = a + (e << 11 | e >>> 21);
            e = 0xd4ef3085 + x03 + c + (d ^ a ^ b);       c = d + (e << 16 | e >>> 16);
            e = 0x04881d05 + x06 + b + (c ^ d ^ a);       b = c + (e << 23 | e >>>  9);
            e = 0xd9d4d039 + x09 + a + (b ^ c ^ d);       a = b + (e <<  4 | e >>> 28);
            e = 0xe6db99e5 + x12 + d + (a ^ b ^ c);       d = a + (e << 11 | e >>> 21);
            e = 0x1fa27cf8 + x15 + c + (d ^ a ^ b);       c = d + (e << 16 | e >>> 16);
            e = 0xc4ac5665 + x02 + b + (c ^ d ^ a);       b = c + (e << 23 | e >>>  9);

            /* Round 4. */
            e = 0xf4292244 + x00 + a + (c ^ (b | ~d));    a = b + (e <<  6 | e >>> 26);
            e = 0x432aff97 + x07 + d + (b ^ (a | ~c));    d = a + (e << 10 | e >>> 22);
            e = 0xab9423a7 + x14 + c + (a ^ (d | ~b));    c = d + (e << 15 | e >>> 17);
            e = 0xfc93a039 + x05 + b + (d ^ (c | ~a));    b = c + (e << 21 | e >>> 11);
            e = 0x655b59c3 + x12 + a + (c ^ (b | ~d));    a = b + (e <<  6 | e >>> 26);
            e = 0x8f0ccc92 + x03 + d + (b ^ (a | ~c));    d = a + (e << 10 | e >>> 22);
            e = 0xffeff47d + x10 + c + (a ^ (d | ~b));    c = d + (e << 15 | e >>> 17);
            e = 0x85845dd1 + x01 + b + (d ^ (c | ~a));    b = c + (e << 21 | e >>> 11);
            e = 0x6fa87e4f + x08 + a + (c ^ (b | ~d));    a = b + (e <<  6 | e >>> 26);
            e = 0xfe2ce6e0 + x15 + d + (b ^ (a | ~c));    d = a + (e << 10 | e >>> 22);
            e = 0xa3014314 + x06 + c + (a ^ (d | ~b));    c = d + (e << 15 | e >>> 17);
            e = 0x4e0811a1 + x13 + b + (d ^ (c | ~a));    b = c + (e << 21 | e >>> 11);
            e = 0xf7537e82 + x04 + a + (c ^ (b | ~d));    a = b + (e <<  6 | e >>> 26);
            e = 0xbd3af235 + x11 + d + (b ^ (a | ~c));    d = a + (e << 10 | e >>> 22);
            e = 0x2ad7d2bb + x02 + c + (a ^ (d | ~b));    c = d + (e << 15 | e >>> 17);
            e = 0xeb86d391 + x09 + b + (d ^ (c | ~a));    b = c + (e << 21 | e >>> 11);

            /* Wrap to 32-bit unsigned modulo 2^32. */
            a = (a + tmpa) << 0; b = (b + tmpb) << 0; c = (c + tmpc) << 0; d = (d + tmpd) << 0;
        }

        /* This will be transformed automagically into the desired output format. */
        return [a, b, c, d];
    }

};

const md5 = (new gruft.MD5()).digest;