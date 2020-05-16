/*!
The MIT License (MIT)

Copyright (c) 2014 Chris Veness

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* This header is placed at the beginning of the output file and defines the
	special `__require`, `__getFilename`, and `__getDirname` functions.
*/
this.geodesy = (function() {
	/* __modules is an Array of functions; each function is a module added
		to the project */
var __modules = {},
	/* __modulesCache is an Array of cached modules, much like
		`require.cache`.  Once a module is executed, it is cached. */
	__modulesCache = {},
	/* __moduleIsCached - an Array of booleans, `true` if module is cached. */
	__moduleIsCached = {};
/* If the module with the specified `uid` is cached, return it;
	otherwise, execute and cache it first. */
function __require(uid, parentUid) {
	if(!__moduleIsCached[uid]) {
		// Populate the cache initially with an empty `exports` Object
		__modulesCache[uid] = {"exports": {}, "loaded": false};
		__moduleIsCached[uid] = true;
		if(uid === 0 && typeof require === "function") {
			require.main = __modulesCache[0];
		} else {
			__modulesCache[uid].parent = __modulesCache[parentUid];
		}
		/* Note: if this module requires itself, or if its depenedencies
			require it, they will only see an empty Object for now */
		// Now load the module
		__modules[uid](__modulesCache[uid], __modulesCache[uid].exports);
		__modulesCache[uid].loaded = true;
	}
	return __modulesCache[uid].exports;
}
/* This function is the replacement for all `__filename` references within a
	project file.  The idea is to return the correct `__filename` as if the
	file was not concatenated at all.  Therefore, we should return the
	filename relative to the output file's path.

	`path` is the path relative to the output file's path at the time the
	project file was concatenated and added to the output file.
*/
function __getFilename(path) {
	return require("path").resolve(__dirname + "/" + path);
}
/* Same deal as __getFilename.
	`path` is the path relative to the output file's path at the time the
	project file was concatenated and added to the output file.
*/
function __getDirname(path) {
	return require("path").resolve(__dirname + "/" + path + "/../");
}
/********** End of header **********/
/********** Start module 0: ./node_modules/geodesy/npm.js **********/
__modules[0] = function(module, exports) {
/* npm main module */
'use strict';
exports.LatLonSpherical   = __require(1,0);
exports.LatLonEllipsoidal = __require(2,0);
var V = __require(3,0);
for (var prop in V) exports.LatLonEllipsoidal[prop] = V[prop];
exports.LatLonVectors     = __require(4,0);
exports.Vector3d          = __require(5,0);
exports.Utm               = __require(6,0);
exports.Mgrs              = __require(7,0);
exports.OsGridRef         = __require(8,0);
exports.Dms               = __require(9,0);

return module.exports;
}
/********** End of module 0: ./node_modules/geodesy/npm.js **********/
/********** Start module 1: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/latlon-spherical.js **********/
__modules[1] = function(module, exports) {
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Latitude/longitude spherical geodesy tools                         (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong.html                                                    */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-spherical.html                       */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var Dms = __require(9,1); // ≡ import Dms from 'dms.js'


/**
 * Library of geodesy functions for operations on a spherical earth model.
 *
 * @module   latlon-spherical
 * @requires dms
 */


/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon) {
    if (!(this instanceof LatLon)) return new LatLon(lat, lon);

    this.lat = Number(lat);
    this.lon = Number(lon);
}


/**
 * Returns the distance from ‘this’ point to destination point (using haversine formula).
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance between this point and destination point, in same units as radius.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var d = p1.distanceTo(p2); // 404.3 km
 */
LatLon.prototype.distanceTo = function(point, radius) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var R = radius;
    var φ1 = this.lat.toRadians(),  λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2)
          + Math.cos(φ1) * Math.cos(φ2)
          * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
};


/**
 * Returns the (initial) bearing from ‘this’ point to destination point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Initial bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var b1 = p1.bearingTo(p2); // 156.2°
 */
LatLon.prototype.bearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();
    var y = Math.sin(Δλ) * Math.cos(φ2);
    var x = Math.cos(φ1)*Math.sin(φ2) -
            Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    var θ = Math.atan2(y, x);

    return (θ.toDegrees()+360) % 360;
};


/**
 * Returns final bearing arriving at destination destination point from ‘this’ point; the final bearing
 * will differ from the initial bearing by varying degrees according to distance and latitude.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Final bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var b2 = p1.finalBearingTo(p2); // 157.9°
 */
LatLon.prototype.finalBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    return ( point.bearingTo(this)+180 ) % 360;
};


/**
 * Returns the midpoint between ‘this’ point and the supplied point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {LatLon} Midpoint between this point and the supplied point.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var pMid = p1.midpointTo(p2); // 50.5363°N, 001.2746°E
 */
LatLon.prototype.midpointTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();

    var Bx = Math.cos(φ2) * Math.cos(Δλ);
    var By = Math.cos(φ2) * Math.sin(Δλ);

    var x = Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By);
    var y = Math.sin(φ1) + Math.sin(φ2);
    var φ3 = Math.atan2(y, x);

    var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

    return new LatLon(φ3.toDegrees(), (λ3.toDegrees()+540)%360-180); // normalise to −180..+180°
};


/**
 * Returns the point at given fraction between ‘this’ point and specified point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @param   {number} fraction - Fraction between the two points (0 = this point, 1 = specified point).
 * @returns {LatLon} Intermediate point between this point and destination point.
 *
 * @example
 *   let p1 = new LatLon(52.205, 0.119);
 *   let p2 = new LatLon(48.857, 2.351);
 *   let pMid = p1.intermediatePointTo(p2, 0.25); // 51.3721°N, 000.7073°E
 */
LatLon.prototype.intermediatePointTo = function(point, fraction) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
    var sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), sinλ1 = Math.sin(λ1), cosλ1 = Math.cos(λ1);
    var sinφ2 = Math.sin(φ2), cosφ2 = Math.cos(φ2), sinλ2 = Math.sin(λ2), cosλ2 = Math.cos(λ2);
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;
    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2)
        + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var A = Math.sin((1-fraction)*δ) / Math.sin(δ);
    var B = Math.sin(fraction*δ) / Math.sin(δ);

    var x = A * cosφ1 * cosλ1 + B * cosφ2 * cosλ2;
    var y = A * cosφ1 * sinλ1 + B * cosφ2 * sinλ2;
    var z = A * sinφ1 + B * sinφ2;

    var φ3 = Math.atan2(z, Math.sqrt(x*x + y*y));
    var λ3 = Math.atan2(y, x);

    return new LatLon(φ3.toDegrees(), (λ3.toDegrees()+540)%360-180); // normalise lon to −180..+180°
};


/**
 * Returns the destination point from ‘this’ point having travelled the given distance on the
 * given initial bearing (bearing normally varies around path followed).
 *
 * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 * @param   {number} bearing - Initial bearing in degrees from north.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0015);
 *     var p2 = p1.destinationPoint(7794, 300.7); // 51.5135°N, 000.0983°W
 */
LatLon.prototype.destinationPoint = function(distance, bearing, radius) {
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var δ = Number(distance) / radius; // angular distance in radians
    var θ = Number(bearing).toRadians();

    var φ1 = this.lat.toRadians();
    var λ1 = this.lon.toRadians();

    var sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1);
    var sinδ = Math.sin(δ), cosδ = Math.cos(δ);
    var sinθ = Math.sin(θ), cosθ = Math.cos(θ);

    var sinφ2 = sinφ1*cosδ + cosφ1*sinδ*cosθ;
    var φ2 = Math.asin(sinφ2);
    var y = sinθ * sinδ * cosφ1;
    var x = cosδ - sinφ1 * sinφ2;
    var λ2 = λ1 + Math.atan2(y, x);

    return new LatLon(φ2.toDegrees(), (λ2.toDegrees()+540)%360-180); // normalise to −180..+180°
};


/**
 * Returns the point of intersection of two paths defined by point and bearing.
 *
 * @param   {LatLon} p1 - First point.
 * @param   {number} brng1 - Initial bearing from first point.
 * @param   {LatLon} p2 - Second point.
 * @param   {number} brng2 - Initial bearing from second point.
 * @returns {LatLon|null} Destination point (null if no unique intersection defined).
 *
 * @example
 *     var p1 = LatLon(51.8853, 0.2545), brng1 = 108.547;
 *     var p2 = LatLon(49.0034, 2.5735), brng2 =  32.435;
 *     var pInt = LatLon.intersection(p1, brng1, p2, brng2); // 50.9078°N, 004.5084°E
 */
LatLon.intersection = function(p1, brng1, p2, brng2) {
    if (!(p1 instanceof LatLon)) throw new TypeError('p1 is not LatLon object');
    if (!(p2 instanceof LatLon)) throw new TypeError('p2 is not LatLon object');

    var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
    var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();
    var θ13 = Number(brng1).toRadians(), θ23 = Number(brng2).toRadians();
    var Δφ = φ2-φ1, Δλ = λ2-λ1;

    var δ12 = 2*Math.asin( Math.sqrt( Math.sin(Δφ/2)*Math.sin(Δφ/2)
        + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2) ) );
    if (δ12 == 0) return null;
    var θa = Math.acos( ( Math.sin(φ2) - Math.sin(φ1)*Math.cos(δ12) ) / ( Math.sin(δ12)*Math.cos(φ1) ) );
    if (isNaN(θa)) θa = 0; // protect against rounding
    var θb = Math.acos( ( Math.sin(φ1) - Math.sin(φ2)*Math.cos(δ12) ) / ( Math.sin(δ12)*Math.cos(φ2) ) );

    var θ12 = Math.sin(λ2-λ1)>0 ? θa : 2*Math.PI-θa;
    var θ21 = Math.sin(λ2-λ1)>0 ? 2*Math.PI-θb : θb;

    var α1 = (θ13 - θ12 + Math.PI) % (2*Math.PI) - Math.PI; // angle 2-1-3
    var α2 = (θ21 - θ23 + Math.PI) % (2*Math.PI) - Math.PI; // angle 1-2-3

    if (Math.sin(α1)==0 && Math.sin(α2)==0) return null; // infinite intersections
    if (Math.sin(α1)*Math.sin(α2) < 0) return null;      // ambiguous intersection

    var α3 = Math.acos( -Math.cos(α1)*Math.cos(α2) + Math.sin(α1)*Math.sin(α2)*Math.cos(δ12) );
    var δ13 = Math.atan2( Math.sin(δ12)*Math.sin(α1)*Math.sin(α2), Math.cos(α2)+Math.cos(α1)*Math.cos(α3) );
    var φ3 = Math.asin( Math.sin(φ1)*Math.cos(δ13) + Math.cos(φ1)*Math.sin(δ13)*Math.cos(θ13) );
    var Δλ13 = Math.atan2( Math.sin(θ13)*Math.sin(δ13)*Math.cos(φ1), Math.cos(δ13)-Math.sin(φ1)*Math.sin(φ3) );
    var λ3 = λ1 + Δλ13;

    return new LatLon(φ3.toDegrees(), (λ3.toDegrees()+540)%360-180); // normalise to −180..+180°
};


/**
 * Returns (signed) distance from ‘this’ point to great circle defined by start-point and end-point.
 *
 * @param   {LatLon} pathStart - Start point of great circle path.
 * @param   {LatLon} pathEnd - End point of great circle path.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance to great circle (-ve if to left, +ve if to right of path).
 *
 * @example
 *   var pCurrent = new LatLon(53.2611, -0.7972);
 *   var p1 = new LatLon(53.3206, -1.7297);
 *   var p2 = new LatLon(53.1887,  0.1334);
 *   var d = pCurrent.crossTrackDistanceTo(p1, p2);  // -307.5 m
 */
LatLon.prototype.crossTrackDistanceTo = function(pathStart, pathEnd, radius) {
    if (!(pathStart instanceof LatLon)) throw new TypeError('pathStart is not LatLon object');
    if (!(pathEnd instanceof LatLon)) throw new TypeError('pathEnd is not LatLon object');
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var δ13 = pathStart.distanceTo(this, radius)/radius;
    var θ13 = pathStart.bearingTo(this).toRadians();
    var θ12 = pathStart.bearingTo(pathEnd).toRadians();

    var dxt = Math.asin( Math.sin(δ13) * Math.sin(θ13-θ12) ) * radius;

    return dxt;
};


/**
 * Returns maximum latitude reached when travelling on a great circle on given bearing from this
 * point ('Clairaut's formula'). Negate the result for the minimum latitude (in the Southern
 * hemisphere).
 *
 * The maximum latitude is independent of longitude; it will be the same for all points on a given
 * latitude.
 *
 * @param {number} bearing - Initial bearing.
 * @param {number} latitude - Starting latitude.
 */
LatLon.prototype.maxLatitude = function(bearing) {
    var θ = Number(bearing).toRadians();

    var φ = this.lat.toRadians();

    var φMax = Math.acos(Math.abs(Math.sin(θ)*Math.cos(φ)));

    return φMax.toDegrees();
};


/**
 * Returns the pair of meridians at which a great circle defined by two points crosses the given
 * latitude. If the great circle doesn't reach the given latitude, null is returned.
 *
 * @param {LatLon} point1 - First point defining great circle.
 * @param {LatLon} point2 - Second point defining great circle.
 * @param {number} latitude - Latitude crossings are to be determined for.
 * @returns {Object|null} Object containing { lon1, lon2 } or null if given latitude not reached.
 */
LatLon.crossingParallels = function(point1, point2, latitude) {
    var φ = Number(latitude).toRadians();

    var φ1 = point1.lat.toRadians();
    var λ1 = point1.lon.toRadians();
    var φ2 = point2.lat.toRadians();
    var λ2 = point2.lon.toRadians();

    var Δλ = λ2 - λ1;

    var x = Math.sin(φ1) * Math.cos(φ2) * Math.cos(φ) * Math.sin(Δλ);
    var y = Math.sin(φ1) * Math.cos(φ2) * Math.cos(φ) * Math.cos(Δλ) - Math.cos(φ1) * Math.sin(φ2) * Math.cos(φ);
    var z = Math.cos(φ1) * Math.cos(φ2) * Math.sin(φ) * Math.sin(Δλ);

    if (z*z > x*x + y*y) return null; // great circle doesn't reach latitude

    var λm = Math.atan2(-y, x);                  // longitude at max latitude
    var Δλi = Math.acos(z / Math.sqrt(x*x+y*y)); // Δλ from λm to intersection points

    var λi1 = λ1 + λm - Δλi;
    var λi2 = λ1 + λm + Δλi;

    return { lon1: (λi1.toDegrees()+540)%360-180, lon2: (λi2.toDegrees()+540)%360-180 }; // normalise to −180..+180°
};


/* Rhumb - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Returns the distance travelling from ‘this’ point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance in km between this point and destination point (same units as radius).
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = new LatLon(50.964, 1.853);
 *     var d = p1.distanceTo(p2); // 40.31 km
 */
LatLon.prototype.rhumbDistanceTo = function(point, radius) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var R = radius;
    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = Math.abs(point.lon-this.lon).toRadians();
    if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);
    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ/Δψ : Math.cos(φ1);
    var δ = Math.sqrt(Δφ*Δφ + q*q*Δλ*Δλ); // angular distance in radians
    var dist = δ * R;

    return dist;
};


/**
 * Returns the bearing from ‘this’ point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = new LatLon(50.964, 1.853);
 *     var d = p1.rhumbBearingTo(p2); // 116.7 m
 */
LatLon.prototype.rhumbBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();
    if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));

    var θ = Math.atan2(Δλ, Δψ);

    return (θ.toDegrees()+360) % 360;
};


/**
 * Returns the destination point having travelled along a rhumb line from ‘this’ point the given
 * distance on the  given bearing.
 *
 * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 * @param   {number} bearing - Bearing in degrees from north.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = p1.rhumbDestinationPoint(40300, 116.7); // 50.9642°N, 001.8530°E
 */
LatLon.prototype.rhumbDestinationPoint = function(distance, bearing, radius) {
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var δ = Number(distance) / radius; // angular distance in radians
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var θ = Number(bearing).toRadians();

    var Δφ = δ * Math.cos(θ);
    var φ2 = φ1 + Δφ;
    if (Math.abs(φ2) > Math.PI/2) φ2 = φ2>0 ? Math.PI-φ2 : -Math.PI-φ2;

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1); // E-W course becomes ill-conditioned with 0/0

    var Δλ = δ*Math.sin(θ)/q;
    var λ2 = λ1 + Δλ;

    return new LatLon(φ2.toDegrees(), (λ2.toDegrees()+540) % 360 - 180); // normalise to −180..+180°
};


/**
 * Returns the loxodromic midpoint (along a rhumb line) between ‘this’ point and second point.
 *
 * @param   {LatLon} point - Latitude/longitude of second point.
 * @returns {LatLon} Midpoint between this point and second point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = new LatLon(50.964, 1.853);
 *     var pMid = p1.rhumbMidpointTo(p2); // 51.0455°N, 001.5957°E
 */
LatLon.prototype.rhumbMidpointTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();

    if (Math.abs(λ2-λ1) > Math.PI) λ1 += 2*Math.PI; // crossing anti-meridian

    var φ3 = (φ1+φ2)/2;
    var f1 = Math.tan(Math.PI/4 + φ1/2);
    var f2 = Math.tan(Math.PI/4 + φ2/2);
    var f3 = Math.tan(Math.PI/4 + φ3/2);
    var λ3 = ( (λ2-λ1)*Math.log(f3) + λ1*Math.log(f2) - λ2*Math.log(f1) ) / Math.log(f2/f1);

    if (!isFinite(λ3)) λ3 = (λ1+λ2)/2; // parallel of latitude

    var p = LatLon(φ3.toDegrees(), (λ3.toDegrees()+540)%360-180); // normalise to −180..+180°

    return p;
};


/* Area - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Calculates the area of a spherical polygon where the sides of the polygon are great circle
 * arcs joining the vertices.
 *
 * @param   {LatLon[]} polygon - Array of points defining vertices of the polygon
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} The area of the polygon, in the same units as radius.
 *
 * @example
 *   var polygon = [new LatLon(0,0), new LatLon(1,0), new LatLon(0,1)];
 *   var area = LatLon.areaOf(polygon); // 6.18e9 m²
 */
LatLon.areaOf = function(polygon, radius) {

    var R = (radius === undefined) ? 6371e3 : Number(radius);
    var closed = polygon[0].equals(polygon[polygon.length-1]);
    if (!closed) polygon.push(polygon[0]);

    var nVertices = polygon.length - 1;

    var S = 0; // spherical excess in steradians
    for (var v=0; v<nVertices; v++) {
        var φ1 = polygon[v].lat.toRadians();
        var φ2 = polygon[v+1].lat.toRadians();
        var Δλ = (polygon[v+1].lon - polygon[v].lon).toRadians();
        var E = 2 * Math.atan2(Math.tan(Δλ/2) * (Math.tan(φ1/2)+Math.tan(φ2/2)), 1 + Math.tan(φ1/2)*Math.tan(φ2/2));
        S += E;
    }

    if (isPoleEnclosedBy(polygon)) S = Math.abs(S) - 2*Math.PI;

    var A = Math.abs(S * R*R); // area in units of R

    if (!closed) polygon.pop(); // restore polygon to pristine condition

    return A;
    function isPoleEnclosedBy(polygon) {
        var ΣΔ = 0;
        var prevBrng = polygon[0].bearingTo(polygon[1]);
        for (var v=0; v<polygon.length-1; v++) {
            var initBrng = polygon[v].bearingTo(polygon[v+1]);
            var finalBrng = polygon[v].finalBearingTo(polygon[v+1]);
            ΣΔ += (initBrng - prevBrng + 540) % 360 - 180;
            ΣΔ += (finalBrng - initBrng + 540) % 360 - 180;
            prevBrng = finalBrng;
        }
        var initBrng = polygon[0].bearingTo(polygon[1]);
        ΣΔ += (initBrng - prevBrng + 540) % 360 - 180;
        var enclosed = Math.abs(ΣΔ) < 90; // 0°-ish
        return enclosed;
    }
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Checks if another point is equal to ‘this’ point.
 *
 * @param   {LatLon} point - Point to be compared against this point.
 * @returns {bool}   True if points are identical.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(52.205, 0.119);
 *   var equal = p1.equals(p2); // true
 */
LatLon.prototype.equals = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    if (this.lat != point.lat) return false;
    if (this.lon != point.lon) return false;

    return true;
};


/**
 * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
    return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon; // ≡ export default LatLon

return module.exports;
}
/********** End of module 1: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/latlon-spherical.js **********/
/********** Start module 2: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/latlon-ellipsoidal.js **********/
__modules[2] = function(module, exports) {
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy tools for an ellipsoidal earth model                       (c) Chris Veness 2005-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-convert-coords.html                                     */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-ellipsoidal.html                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var Vector3d = __require(5,2); // ≡ import Vector3d from 'vector3d.js'
if (typeof module!='undefined' && module.exports) var Dms = __require(9,2);           // ≡ import Dms from 'dms.js'


/**
 * Library of geodesy functions for operations on an ellipsoidal earth model.
 *
 * Includes ellipsoid parameters and datums for different coordinate systems, and methods for
 * converting between them and to cartesian coordinates.
 *
 * q.v. Ordnance Survey ‘A guide to coordinate systems in Great Britain’ Section 6
 * www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf.
 *
 * @module   latlon-ellipsoidal
 * @requires dms
 */


/**
 * Creates lat/lon (polar) point with latitude & longitude values, on a specified datum.
 *
 * @constructor
 * @param {number}       lat - Geodetic latitude in degrees.
 * @param {number}       lon - Longitude in degrees.
 * @param {LatLon.datum} [datum=WGS84] - Datum this point is defined within.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0016, LatLon.datum.WGS84);
 */
function LatLon(lat, lon, datum) {
    if (!(this instanceof LatLon)) return new LatLon(lat, lon, datum);

    if (datum === undefined) datum = LatLon.datum.WGS84;

    this.lat = Number(lat);
    this.lon = Number(lon);
    this.datum = datum;
}


/**
 * Ellipsoid parameters; major axis (a), minor axis (b), and flattening (f) for each ellipsoid.
 */
LatLon.ellipsoid = {
    WGS84:        { a: 6378137,     b: 6356752.31425, f: 1/298.257223563 },
    GRS80:        { a: 6378137,     b: 6356752.31414, f: 1/298.257222101 },
    Airy1830:     { a: 6377563.396, b: 6356256.909,   f: 1/299.3249646   },
    AiryModified: { a: 6377340.189, b: 6356034.448,   f: 1/299.3249646   },
    Intl1924:     { a: 6378388,     b: 6356911.946,   f: 1/297           },
    Bessel1841:   { a: 6377397.155, b: 6356078.963,   f: 1/299.152815351 },
};

/**
 * Datums; with associated ellipsoid, and Helmert transform parameters to convert from WGS 84 into
 * given datum.
 *
 * More are available from earth-info.nga.mil/GandG/coordsys/datums/NATO_DT.pdf,
 * www.fieldenmaps.info/cconv/web/cconv_params.js, itrf.ensg.ign.fr/trans_para.php,
 * www.euref.eu/symposia/2012Paris/03-01-Altamimi.pdf (ITRF2008 -> ITRFyy,ITRFyy -> ETRF2000)
 */
LatLon.datum = {
    /* eslint key-spacing: 0, comma-dangle: 0 */
    WGS84: {
        ellipsoid: LatLon.ellipsoid.WGS84,
        transform: { tx:    0.0,    ty:    0.0,     tz:    0.0,    // m
                     rx:    0.0,    ry:    0.0,     rz:    0.0,    // sec
                      s:    0.0 }                                  // ppm
    },
    ITRF90: { // ftp://itrf.ensg.ign.fr/pub/itrf/WGS84.TXT
        ellipsoid: LatLon.ellipsoid.GRS80,
        transform: { tx:   -0.060,  ty:    0.517,   tz:    0.223,  // m
                     rx:   -0.0183, ry:    0.0003,  rz:   -0.0070, // sec
                      s:    0.011 }                                // ppm
    },
    NAD83: { // (2009); functionally ≡ WGS84 - www.uvm.edu/giv/resources/WGS84_NAD83.pdf
        ellipsoid: LatLon.ellipsoid.GRS80,
        transform: { tx:    1.004,  ty:   -1.910,   tz:   -0.515,  // m
                     rx:    0.0267, ry:    0.00034, rz:    0.011,  // sec
                      s:   -0.0015 }                               // ppm
    }, // note: if you *really* need to convert WGS84<->NAD83, you need more knowledge than this!
    OSGB36: { // www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf
        ellipsoid: LatLon.ellipsoid.Airy1830,
        transform: { tx: -446.448,  ty:  125.157,   tz: -542.060,  // m
                     rx:   -0.1502, ry:   -0.2470,  rz:   -0.8421, // sec
                      s:   20.4894 }                               // ppm
    },
    ED50: { // www.gov.uk/guidance/oil-and-gas-petroleum-operations-notices#pon-4
        ellipsoid: LatLon.ellipsoid.Intl1924,
        transform: { tx:   89.5,    ty:   93.8,     tz:  123.1,    // m
                     rx:    0.0,    ry:    0.0,     rz:    0.156,  // sec
                      s:   -1.2 }                                  // ppm
    },
    Irl1975: { // osi.ie/OSI/media/OSI/Content/Publications/transformations_booklet.pdf
        ellipsoid: LatLon.ellipsoid.AiryModified,
        transform: { tx: -482.530,  ty:  130.596,   tz: -564.557,  // m
                     rx:   -1.042,  ry:   -0.214,   rz:   -0.631,  // sec
                      s:   -8.150 }                                // ppm
    }, // note: many sources have opposite sign to rotations - to be checked!
    TokyoJapan: { // www.geocachingtoolbox.com?page=datumEllipsoidDetails
        ellipsoid: LatLon.ellipsoid.Bessel1841,
        transform: { tx:  148,      ty: -507,       tz: -685,      // m
                     rx:    0,      ry:    0,       rz:    0,      // sec
                      s:    0 }                                    // ppm
    },
};


/**
 * Converts ‘this’ lat/lon coordinate to new coordinate system.
 *
 * @param   {LatLon.datum} toDatum - Datum this coordinate is to be converted to.
 * @returns {LatLon} This point converted to new datum.
 *
 * @example
 *     var pWGS84 = new LatLon(51.4778, -0.0016, LatLon.datum.WGS84);
 *     var pOSGB = pWGS84.convertDatum(LatLon.datum.OSGB36); // 51.4773°N, 000.0000°E
 */
LatLon.prototype.convertDatum = function(toDatum) {
    var oldLatLon = this;
    var transform;

    if (oldLatLon.datum == LatLon.datum.WGS84) {
        transform = toDatum.transform;
    }
    if (toDatum == LatLon.datum.WGS84) {
        transform = {};
        for (var param in oldLatLon.datum.transform) {
            if (oldLatLon.datum.transform.hasOwnProperty(param)) {
                transform[param] = -oldLatLon.datum.transform[param];
            }
        }
    }
    if (transform === undefined) {
        oldLatLon = this.convertDatum(LatLon.datum.WGS84);
        transform = toDatum.transform;
    }

    var oldCartesian = oldLatLon.toCartesian();                // convert polar to cartesian...
    var newCartesian = oldCartesian.applyTransform(transform); // ...apply transform...
    var newLatLon = newCartesian.toLatLonE(toDatum);           // ...and convert cartesian to polar

    return newLatLon;
};


/**
 * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric) cartesian
 * (x/y/z) coordinates.
 *
 * @returns {Vector3d} Vector pointing to lat/lon point, with x, y, z in metres from earth centre.
 */
LatLon.prototype.toCartesian = function() {
    var φ = this.lat.toRadians(), λ = this.lon.toRadians();
    var h = 0; // height above ellipsoid - not currently used
    var a = this.datum.ellipsoid.a, f = this.datum.ellipsoid.f;

    var sinφ = Math.sin(φ), cosφ = Math.cos(φ);
    var sinλ = Math.sin(λ), cosλ = Math.cos(λ);

    var eSq = 2*f - f*f;                      // 1st eccentricity squared ≡ (a²-b²)/a²
    var ν = a / Math.sqrt(1 - eSq*sinφ*sinφ); // radius of curvature in prime vertical

    var x = (ν+h) * cosφ * cosλ;
    var y = (ν+h) * cosφ * sinλ;
    var z = (ν*(1-eSq)+h) * sinφ;

    var point = new Vector3d(x, y, z);

    return point;
};


/**
 * Converts ‘this’ (geocentric) cartesian (x/y/z) point to (ellipsoidal geodetic) latitude/longitude
 * coordinates on specified datum.
 *
 * Uses Bowring’s (1985) formulation for μm precision in concise form.
 *
 * @param {LatLon.datum.transform} datum - Datum to use when converting point.
 */
Vector3d.prototype.toLatLonE = function(datum) {
    var x = this.x, y = this.y, z = this.z;
    var a = datum.ellipsoid.a, b = datum.ellipsoid.b, f = datum.ellipsoid.f;

    var e2 = 2*f - f*f;   // 1st eccentricity squared ≡ (a²-b²)/a²
    var ε2 = e2 / (1-e2); // 2nd eccentricity squared ≡ (a²-b²)/b²
    var p = Math.sqrt(x*x + y*y); // distance from minor axis
    var R = Math.sqrt(p*p + z*z); // polar radius
    var tanβ = (b*z)/(a*p) * (1+ε2*b/R);
    var sinβ = tanβ / Math.sqrt(1+tanβ*tanβ);
    var cosβ = sinβ / tanβ;
    var φ = isNaN(cosβ) ? 0 : Math.atan2(z + ε2*b*sinβ*sinβ*sinβ, p - e2*a*cosβ*cosβ*cosβ);
    var λ = Math.atan2(y, x);
    var sinφ = Math.sin(φ), cosφ = Math.cos(φ);
    var ν = a/Math.sqrt(1-e2*sinφ*sinφ); // length of the normal terminated by the minor axis
    var h = p*cosφ + z*sinφ - (a*a/ν);

    var point = new LatLon(φ.toDegrees(), λ.toDegrees(), datum);

    return point;
};

/**
 * Applies Helmert transform to ‘this’ point using transform parameters t.
 *
 * @private
 * @param {LatLon.datum.transform} t - Transform to apply to this point.
 */
Vector3d.prototype.applyTransform = function(t)   {
    var x1 = this.x, y1 = this.y, z1 = this.z;

    var tx = t.tx, ty = t.ty, tz = t.tz;
    var rx = (t.rx/3600).toRadians(); // normalise seconds to radians
    var ry = (t.ry/3600).toRadians(); // normalise seconds to radians
    var rz = (t.rz/3600).toRadians(); // normalise seconds to radians
    var s1 = t.s/1e6 + 1;             // normalise ppm to (s+1)
    var x2 = tx + x1*s1 - y1*rz + z1*ry;
    var y2 = ty + x1*rz + y1*s1 - z1*rx;
    var z2 = tz - x1*ry + y1*rx + z1*s1;

    var point = new Vector3d(x2, y2, z2);

    return point;
};


/**
 * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
    return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon, module.exports.Vector3d = Vector3d; // ≡ export { LatLon as default, Vector3d }

return module.exports;
}
/********** End of module 2: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/latlon-ellipsoidal.js **********/
/********** Start module 3: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/latlon-vincenty.js **********/
__modules[3] = function(module, exports) {
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vincenty Direct and Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-vincenty.html                                           */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-vincenty.html                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var LatLon = __require(2,3); // ≡ import LatLon from 'latlon-ellipsoidal.js'


/**
 * Direct and inverse solutions of geodesics on the ellipsoid using Vincenty formulae.
 *
 * From: T Vincenty, "Direct and Inverse Solutions of Geodesics on the Ellipsoid with application of
 *       nested equations", Survey Review, vol XXIII no 176, 1975.
 *       www.ngs.noaa.gov/PUBS_LIB/inverse.pdf.
 *
 * @module  latlon-vincenty
 * @extends latlon-ellipsoidal
 */
/** @class LatLon */


/**
 * Returns the distance between ‘this’ point and destination point along a geodesic, using Vincenty
 * inverse solution.
 *
 * Note: the datum used is of ‘this’ point; distance is on the surface of the ellipsoid (height is
 * ignored).
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns (Number} Distance in metres between points or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLon(50.06632, -5.71475);
 *   var p2 = new LatLon(58.64402, -3.07009);
 *   var d = p1.distanceTo(p2); // 969,954.166 m
 */
LatLon.prototype.distanceTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    try {
        return this.inverse(point).distance;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the initial bearing (forward azimuth) to travel along a geodesic from ‘this’ point to the
 * specified point, using Vincenty inverse solution.
 *
 * Note: the datum used is of ‘this’ point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number}  initial Bearing in degrees from north (0°..360°) or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLon(50.06632, -5.71475);
 *   var p2 = new LatLon(58.64402, -3.07009);
 *   var b1 = p1.initialBearingTo(p2); // 9.1419°
 */
LatLon.prototype.initialBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    try {
        return this.inverse(point).initialBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the final bearing (reverse azimuth) having travelled along a geodesic from ‘this’ point
 * to the specified point, using Vincenty inverse solution.
 *
 * Note: the datum used is of ‘this’ point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number}  Initial bearing in degrees from north (0°..360°) or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLon(50.06632, -5.71475);
 *   var p2 = new LatLon(58.64402, -3.07009);
 *   var b2 = p1.finalBearingTo(p2); // 11.2972°
 */
LatLon.prototype.finalBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    try {
        return this.inverse(point).finalBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the destination point having travelled the given distance along a geodesic given by
 * initial bearing from ‘this’ point, using Vincenty direct solution.
 *
 * Note: the datum used is of ‘this’ point; distance is on the surface of the ellipsoid (height is
 * ignored).
 *
 * @param   {number} distance - Distance travelled along the geodesic in metres.
 * @param   {number} initialBearing - Initial bearing in degrees from north.
 * @returns {LatLon} Destination point.
 *
 * @example
 *   var p1 = new LatLon(-37.95103, 144.42487);
 *   var p2 = p1.destinationPoint(54972.271, 306.86816); // 37.6528°S, 143.9265°E
 */
LatLon.prototype.destinationPoint = function(distance, initialBearing) {
    return this.direct(Number(distance), Number(initialBearing)).point;
};


/**
 * Returns the final bearing (reverse azimuth) having travelled along a geodesic given by initial
 * bearing for a given distance from ‘this’ point, using Vincenty direct solution.
 *
 * Note: the datum used is of ‘this’ point; distance is on the surface of the ellipsoid (height is
 * ignored).
 *
 * @param   {number} distance - Distance travelled along the geodesic in metres.
 * @param   {LatLon} initialBearing - Initial bearing in degrees from north.
 * @returns {number} Final bearing in degrees from north (0°..360°).
 *
 * @example
 *   var p1 = new LatLon(-37.95103, 144.42487);
 *   var b2 = p1.finalBearingOn(306.86816, 54972.271); // 307.1736°
 */
LatLon.prototype.finalBearingOn = function(distance, initialBearing) {
    return this.direct(Number(distance), Number(initialBearing)).finalBearing;
};


/**
 * Vincenty direct calculation.
 *
 * @private
 * @param   {number} distance - Distance along bearing in metres.
 * @param   {number} initialBearing - Initial bearing in degrees from north.
 * @returns (Object} Object including point (destination point), finalBearing.
 * @throws  {Error}  If formula failed to converge.
 */
LatLon.prototype.direct = function(distance, initialBearing) {
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var α1 = initialBearing.toRadians();
    var s = distance;

    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    var sinα1 = Math.sin(α1);
    var cosα1 = Math.cos(α1);

    var tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    var σ1 = Math.atan2(tanU1, cosα1);
    var sinα = cosU1 * sinα1;
    var cosSqα = 1 - sinα*sinα;
    var uSq = cosSqα * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));

    var cos2σM, sinσ, cosσ, Δσ;

    var σ = s / (b*A), σʹ, iterations = 0;
    do {
        cos2σM = Math.cos(2*σ1 + σ);
        sinσ = Math.sin(σ);
        cosσ = Math.cos(σ);
        Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
            B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));
        σʹ = σ;
        σ = s / (b*A) + Δσ;
    } while (Math.abs(σ-σʹ) > 1e-12 && ++iterations<200);
    if (iterations>=200) throw new Error('Formula failed to converge'); // not possible?

    var x = sinU1*sinσ - cosU1*cosσ*cosα1;
    var φ2 = Math.atan2(sinU1*cosσ + cosU1*sinσ*cosα1, (1-f)*Math.sqrt(sinα*sinα + x*x));
    var λ = Math.atan2(sinσ*sinα1, cosU1*cosσ - sinU1*sinσ*cosα1);
    var C = f/16*cosSqα*(4+f*(4-3*cosSqα));
    var L = λ - (1-C) * f * sinα *
        (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    var λ2 = (λ1+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180..+180

    var α2 = Math.atan2(sinα, -x);
    α2 = (α2 + 2*Math.PI) % (2*Math.PI); // normalise to 0..360

    return {
        point:        new LatLon(φ2.toDegrees(), λ2.toDegrees(), this.datum),
        finalBearing: α2.toDegrees(),
    };
};


/**
 * Vincenty inverse calculation.
 *
 * @private
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {Object} Object including distance, initialBearing, finalBearing.
 * @throws  {Error}  If formula failed to converge.
 */
LatLon.prototype.inverse = function(point) {
    var p1 = this, p2 = point;
    var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
    var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();

    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    var L = λ2 - λ1;
    var tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    var tanU2 = (1-f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2*tanU2)), sinU2 = tanU2 * cosU2;

    var sinλ, cosλ, sinSqσ, sinσ, cosσ, σ, sinα, cosSqα, cos2σM, C;

    var λ = L, λʹ, iterations = 0;
    do {
        sinλ = Math.sin(λ);
        cosλ = Math.cos(λ);
        sinSqσ = (cosU2*sinλ) * (cosU2*sinλ) + (cosU1*sinU2-sinU1*cosU2*cosλ) * (cosU1*sinU2-sinU1*cosU2*cosλ);
        sinσ = Math.sqrt(sinSqσ);
        if (sinσ == 0) return 0;  // co-incident points
        cosσ = sinU1*sinU2 + cosU1*cosU2*cosλ;
        σ = Math.atan2(sinσ, cosσ);
        sinα = cosU1 * cosU2 * sinλ / sinσ;
        cosSqα = 1 - sinα*sinα;
        cos2σM = cosσ - 2*sinU1*sinU2/cosSqα;
        if (isNaN(cos2σM)) cos2σM = 0;  // equatorial line: cosSqα=0 (§6)
        C = f/16*cosSqα*(4+f*(4-3*cosSqα));
        λʹ = λ;
        λ = L + (1-C) * f * sinα * (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    } while (Math.abs(λ-λʹ) > 1e-12 && ++iterations<200);
    if (iterations>=200) throw new Error('Formula failed to converge');

    var uSq = cosSqα * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
    var Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
        B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));

    var s = b*A*(σ-Δσ);

    var α1 = Math.atan2(cosU2*sinλ,  cosU1*sinU2-sinU1*cosU2*cosλ);
    var α2 = Math.atan2(cosU1*sinλ, -sinU1*cosU2+cosU1*sinU2*cosλ);

    α1 = (α1 + 2*Math.PI) % (2*Math.PI); // normalise to 0..360
    α2 = (α2 + 2*Math.PI) % (2*Math.PI); // normalise to 0..360

    s = Number(s.toFixed(3)); // round to 1mm precision
    return { distance: s, initialBearing: α1.toDegrees(), finalBearing: α2.toDegrees() };
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon; // ≡ export default LatLon

return module.exports;
}
/********** End of module 3: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/latlon-vincenty.js **********/
/********** Start module 4: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/latlon-vectors.js **********/
__modules[4] = function(module, exports) {
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Vector-based spherical geodetic (latitude/longitude) functions    (c) Chris Veness 2011-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-vectors.html                                            */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-nvector-spherical.html               */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var Vector3d = __require(5,4); // ≡ import Vector3d from 'vector3d.js'
if (typeof module!='undefined' && module.exports) var Dms = __require(9,4);           // ≡ import Dms from 'dms.js'


/**
 * Tools for working with points and paths on (a spherical model of) the earth’s surface using a
 * vector-based approach using ‘n-vectors’ (rather than the more common spherical trigonometry;
 * a vector-based approach makes many calculations much simpler, and easier to follow, compared
 * with trigonometric equivalents).
 *
 * Note on a spherical model earth, an n-vector is equivalent to a normalised version of an (ECEF)
 * cartesian coordinate.
 *
 * @module   latlon-vectors
 * @requires vector3d
 * @requires dms
 */


/**
 * Creates a LatLon point on spherical model earth.
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon) {
    if (!(this instanceof LatLon)) return new LatLon(lat, lon);

    this.lat = Number(lat);
    this.lon = Number(lon);
}


/**
 * Converts ‘this’ lat/lon point to Vector3d n-vector (normal to earth's surface).
 *
 * @returns {Vector3d} Normalised n-vector representing lat/lon point.
 *
 * @example
 *   var p = new LatLon(45, 45);
 *   var v = p.toVector(); // [0.5000,0.5000,0.7071]
 */
LatLon.prototype.toVector = function() {
    var φ = this.lat.toRadians();
    var λ = this.lon.toRadians();
    var x = Math.cos(φ) * Math.cos(λ);
    var y = Math.cos(φ) * Math.sin(λ);
    var z = Math.sin(φ);

    return new Vector3d(x, y, z);
};


/**
 * Converts ‘this’ (geocentric) cartesian vector to (spherical) latitude/longitude point.
 *
 * @returns  {LatLon} Latitude/longitude point vector points to.
 *
 * @example
 *   var v = new Vector3d(0.500, 0.500, 0.707);
 *   var p = v.toLatLonS(); // 45.0°N, 45.0°E
 */
Vector3d.prototype.toLatLonS = function() {
    var φ = Math.atan2(this.z, Math.sqrt(this.x*this.x + this.y*this.y));
    var λ = Math.atan2(this.y, this.x);

    return new LatLon(φ.toDegrees(), λ.toDegrees());
};


/**
 * N-vector normal to great circle obtained by heading on given bearing from ‘this’ point.
 *
 * Direction of vector is such that initial bearing vector b = c × p.
 *
 * @param   {number}   bearing - Compass bearing in degrees.
 * @returns {Vector3d} Normalised vector representing great circle.
 *
 * @example
 *   var p1 = new LatLon(53.3206, -1.7297);
 *   var gc = p1.greatCircle(96.0); // [-0.794,0.129,0.594]
 */
LatLon.prototype.greatCircle = function(bearing) {
    var φ = this.lat.toRadians();
    var λ = this.lon.toRadians();
    var θ = Number(bearing).toRadians();

    var x =  Math.sin(λ) * Math.cos(θ) - Math.sin(φ) * Math.cos(λ) * Math.sin(θ);
    var y = -Math.cos(λ) * Math.cos(θ) - Math.sin(φ) * Math.sin(λ) * Math.sin(θ);
    var z =  Math.cos(φ) * Math.sin(θ);

    return new Vector3d(x, y, z);
};


/**
 * N-vector normal to great circle obtained by heading on given bearing from point given by ‘this’
 * n-vector.
 *
 * Direction of vector is such that initial bearing vector b = c × p.
 *
 * @param   {number}   bearing - Compass bearing in degrees.
 * @returns {Vector3d} Normalised vector representing great circle.
 *
 * @example
 *   var n1 = new LatLon(53.3206, -1.7297).toNvector();
 *   var gc = n1.greatCircle(96.0); // [-0.794,0.129,0.594]
 */
Vector3d.prototype.greatCircle = function(bearing) {
    var θ = Number(bearing).toRadians();

    var N = new Vector3d(0, 0, 1);
    var e = N.cross(this); // easting
    var n = this.cross(e); // northing
    var eʹ = e.times(Math.cos(θ)/e.length());
    var nʹ = n.times(Math.sin(θ)/n.length());
    var c = nʹ.minus(eʹ);

    return c;
};


/**
 * Returns the distance from ‘this’ point to the specified point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance between this point and destination point, in same units as radius.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(48.857, 2.351);
 *   var d = p1.distanceTo(p2); // 404.3 km
 */
LatLon.prototype.distanceTo = function(point, radius) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var p1 = this.toVector();
    var p2 = point.toVector();

    var δ = p1.angleTo(p2);
    var d = δ * radius;

    return d;
};


/**
 * Returns the (initial) bearing from ‘this’ point to the specified point, in compass degrees.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Initial bearing in degrees from North (0°..360°).
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(48.857, 2.351);
 *   var b1 = p1.bearingTo(p2); // 156.2°
 */
LatLon.prototype.bearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var p1 = this.toVector();
    var p2 = point.toVector();

    var northPole = new Vector3d(0, 0, 1);

    var c1 = p1.cross(p2);        // great circle through p1 & p2
    var c2 = p1.cross(northPole); // great circle through p1 & north pole
    var bearing = c1.angleTo(c2, p1).toDegrees();

    return (bearing+360) % 360; // normalise to 0..360
};


/**
 * Returns the midpoint between ‘this’ point and specified point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {LatLon} Midpoint between this point and destination point.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(48.857, 2.351);
 *   var pMid = p1.midpointTo(p2); // 50.5363°N, 001.2746°E
 */
LatLon.prototype.midpointTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var p1 = this.toVector();
    var p2 = point.toVector();

    var mid = p1.plus(p2).unit();

    return mid.toLatLonS();
};


/**
 * Returns the destination point from ‘this’ point having travelled the given distance on the
 * given initial bearing (bearing will normally vary before destination is reached).
 *
 * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 * @param   {number} bearing - Initial bearing in degrees from north.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {LatLon} Destination point.
 *
 * @example
 *   var p1 = new LatLon(51.4778, -0.0015);
 *   var p2 = p1.destinationPoint(7794, 300.7); // 51.5135°N, 000.0983°W
 */
LatLon.prototype.destinationPoint = function(distance, bearing, radius) {
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var n1 = this.toVector();
    var δ = Number(distance) / radius; // angular distance in radians
    var θ = Number(bearing).toRadians();

    var N = new Vector3d(0, 0, 1); // north pole

    var de = N.cross(n1).unit();   // east direction vector @ n1
    var dn = n1.cross(de);         // north direction vector @ n1

    var deSinθ = de.times(Math.sin(θ));
    var dnCosθ = dn.times(Math.cos(θ));

    var d = dnCosθ.plus(deSinθ);   // direction vector @ n1 (≡ C×n1; C = great circle)

    var x = n1.times(Math.cos(δ)); // component of n2 parallel to n1
    var y = d.times(Math.sin(δ));  // component of n2 perpendicular to n1

    var n2 = x.plus(y);

    return n2.toLatLonS();
};


/**
 * Returns the point of intersection of two paths each defined by point pairs or start point and bearing.
 *
 * @param   {LatLon}        path1start - Start point of first path.
 * @param   {LatLon|number} path1brngEnd - End point of first path or initial bearing from first start point.
 * @param   {LatLon}        path2start - Start point of second path.
 * @param   {LatLon|number} path2brngEnd - End point of second path or initial bearing from second start point.
 * @returns {LatLon}        Destination point (null if no unique intersection defined)
 *
 * @example
 *   var p1 = LatLon(51.8853, 0.2545), brng1 = 108.55;
 *   var p2 = LatLon(49.0034, 2.5735), brng2 =  32.44;
 *   var pInt = LatLon.intersection(p1, brng1, p2, brng2); // 50.9076°N, 004.5086°E
 */
LatLon.intersection = function(path1start, path1brngEnd, path2start, path2brngEnd) {
    if (!(path1start instanceof LatLon)) throw new TypeError('path1start is not LatLon object');
    if (!(path2start instanceof LatLon)) throw new TypeError('path2start is not LatLon object');
    if (!(path1brngEnd instanceof LatLon) && isNaN(path1brngEnd)) throw new TypeError('path1brngEnd is not LatLon object or bearing');
    if (!(path2brngEnd instanceof LatLon) && isNaN(path2brngEnd)) throw new TypeError('path2brngEnd is not LatLon object or bearing');

    var p1 = path1start.toVector();
    var p2 = path2start.toVector();

    var c1, c2, path1def, path2def;

    if (path1brngEnd instanceof LatLon) { // path 1 defined by endpoint
        c1 = p1.cross(path1brngEnd.toVector());
        path1def = 'endpoint';
    } else {                              // path 1 defined by initial bearing
        c1 = path1start.greatCircle(Number(path1brngEnd));
        path1def = 'bearing';
    }
    if (path2brngEnd instanceof LatLon) { // path 2 defined by endpoint
        c2 = p2.cross(path2brngEnd.toVector());
        path2def = 'endpoint';
    } else {                              // path 2 defined by initial bearing
        c2 = path2start.greatCircle(Number(path2brngEnd));
        path2def = 'bearing';
    }
    var i1 = c1.cross(c2);
    var i2 = c2.cross(c1);
    var intersection=null, dir1=null, dir2=null;
    switch (path1def+'+'+path2def) {
        case 'bearing+bearing':
            dir1 = Math.sign(c1.cross(p1).dot(i1)); // c1×p1⋅i1 +ve means p1 bearing points to i1
            dir2 = Math.sign(c2.cross(p2).dot(i1)); // c2×p2⋅i1 +ve means p2 bearing points to i1

            switch (dir1+dir2) {
                case  2: // dir1, dir2 both +ve, 1 & 2 both pointing to i1
                    intersection = i1;
                    break;
                case -2: // dir1, dir2 both -ve, 1 & 2 both pointing to i2
                    intersection = i2;
                    break;
                case  0: // dir1, dir2 opposite; intersection is at further-away intersection point
                    intersection = p1.plus(p2).dot(i1) > 0 ? i2 : i1;
                    break;
            }
            break;
        case 'bearing+endpoint': // use bearing c1 × p1
            dir1 = Math.sign(c1.cross(p1).dot(i1)); // c1×p1⋅i1 +ve means p1 bearing points to i1
            intersection = dir1>0 ? i1 : i2;
            break;
        case 'endpoint+bearing': // use bearing c2 × p2
            dir2 = Math.sign(c2.cross(p2).dot(i1)); // c2×p2⋅i1 +ve means p2 bearing points to i1
            intersection = dir2>0 ? i1 : i2;
            break;
        case 'endpoint+endpoint': // select nearest intersection to mid-point of all points
            var mid = p1.plus(p2).plus(path1brngEnd.toVector()).plus(path2brngEnd.toVector());
            intersection = mid.dot(i1)>0 ? i1 : i2;
            break;
    }

    return intersection.toLatLonS();
};


/**
 * Returns (signed) distance from ‘this’ point to great circle defined by start-point and end-point/bearing.
 *
 * @param   {LatLon}        pathStart - Start point of great circle path.
 * @param   {LatLon|number} pathBrngEnd - End point of great circle path or initial bearing from great circle start point.
 * @param   {number}        [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number}        Distance to great circle (-ve if to left, +ve if to right of path).
 *
 * @example
 *   var pCurrent = new LatLon(53.2611, -0.7972);
 *
 *   var p1 = new LatLon(53.3206, -1.7297), brng = 96.0;
 *   var d = pCurrent.crossTrackDistanceTo(p1, brng);// -305.7 m
 *
 *   var p1 = new LatLon(53.3206, -1.7297), p2 = new LatLon(53.1887, 0.1334);
 *   var d = pCurrent.crossTrackDistanceTo(p1, p2);  // -307.5 m
 */
LatLon.prototype.crossTrackDistanceTo = function(pathStart, pathBrngEnd, radius) {
    if (!(pathStart instanceof LatLon)) throw new TypeError('pathStart is not LatLon object');
    var R = (radius === undefined) ? 6371e3 : Number(radius);

    var p = this.toVector();

    var gc = pathBrngEnd instanceof LatLon                   // (note JavaScript is not good at method overloading)
        ? pathStart.toVector().cross(pathBrngEnd.toVector()) // great circle defined by two points
        : pathStart.greatCircle(Number(pathBrngEnd));        // great circle defined by point + bearing

    var α = gc.angleTo(p) - Math.PI/2; // angle between point & great-circle

    var d = α * R;

    return d;
};


/**
 * Returns closest point on great circle segment between point1 & point2 to ‘this’ point.
 *
 * If this point is ‘within’ the extent of the segment, the point is on the segment between point1 &
 * point2; otherwise, it is the closer of the endpoints defining the segment.
 *
 * @param   {LatLon} point1 - Start point of great circle segment.
 * @param   {LatLon} point2 - End point of great circle segment.
 * @returns {number} point on segment.
 *
 * @example
 *   var p1 = new LatLon(51.0, 1.0), p2 = new LatLon(51.0, 2.0);
 *
 *   var p0 = new LatLon(51.0, 1.9);
 *   var p = p0.nearestPointOnSegment(p1, p2); // 51.0004°N, 001.9000°E
 *   var d = p.distanceTo(p);                  // 42.71 m
 *
 *   var p0 = new LatLon(51.0, 2.1);
 *   var p = p0.nearestPointOnSegment(p1, p2); // 51.0000°N, 002.0000°E
 */
LatLon.prototype.nearestPointOnSegment = function(point1, point2) {
    var p = null;

    if (this.isBetween(point1, point2)) {
        var n0 = this.toVector(), n1 = point1.toVector(), n2 = point2.toVector();
        var c1 = n1.cross(n2); // n1×n2 = vector representing great circle through p1, p2
        var c2 = n0.cross(c1); // n0×c1 = vector representing great circle through p0 normal to c1
        var n = c1.cross(c2);  // c2×c1 = nearest point on c1 to n0
        p = n.toLatLonS();
    } else {
        var d1 = this.distanceTo(point1);
        var d2 = this.distanceTo(point2);
        p = d1<d2 ? point1 : point2;
    }

    return p;
};


/**
 * Returns whether this point is between point 1 & point 2.
 *
 * If this point is not on the great circle defined by point1 & point 2, returns whether this point
 * is within area bound by perpendiculars to the great circle at each point.
 *
 * @param   {LatLon} point1 - First point defining segment.
 * @param   {LatLon} point2 - Second point defining segment.
 * @returns {boolean} Whether this point is within extent of segment.
 */
LatLon.prototype.isBetween = function(point1, point2) {
    var n0 = this.toVector(), n1 = point1.toVector(), n2 = point2.toVector(); // n-vectors
    var δ10 = n0.minus(n1), δ12 = n2.minus(n1);
    var δ20 = n0.minus(n2), δ21 = n1.minus(n2);
    var extent1 = δ10.dot(δ12);
    var extent2 = δ20.dot(δ21);

    var isBetween = extent1>=0 && extent2>=0;

    return isBetween;
};


/**
 * Tests whether ‘this’ point is enclosed by the polygon defined by a set of points.
 *
 * @param   {LatLon[]} polygon - Ordered array of points defining vertices of polygon.
 * @returns {bool}     Whether this point is enclosed by polygon.
 *
 * @example
 *   var bounds = [ new LatLon(45,1), new LatLon(45,2), new LatLon(46,2), new LatLon(46,1) ];
 *   var p = new LatLon(45.1, 1.1);
 *   var inside = p.enclosedBy(bounds); // true
 */
LatLon.prototype.enclosedBy = function(polygon) {
    var closed = polygon[0].equals(polygon[polygon.length-1]);
    if (!closed) polygon.push(polygon[0]);

    var nVertices = polygon.length - 1;

    var p = this.toVector();
    var vectorToVertex = [];
    for (var v=0; v<nVertices; v++) vectorToVertex[v] = p.minus(polygon[v].toVector());
    vectorToVertex.push(vectorToVertex[0]);
    var Σθ = 0;
    for (var v=0; v<nVertices; v++) {
        Σθ += vectorToVertex[v].angleTo(vectorToVertex[v+1], p);
    }

    var enclosed = Math.abs(Σθ) > Math.PI;

    if (!closed) polygon.pop(); // restore polygon to pristine condition

    return enclosed;
};


/**
 * Calculates the area of a spherical polygon where the sides of the polygon are great circle
 * arcs joining the vertices.
 *
 * @param   {LatLon[]} polygon - Array of points defining vertices of the polygon
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns The area of the polygon in the same units as radius.
 *
 * @example
 *   var polygon = [new LatLon(0,0), new LatLon(1,0), new LatLon(0,1)];
 *   var area = LatLon.areaOf(polygon); // 6.18e9 m² TODO: fix!
 */
LatLon.areaOf = function(polygon, radius) {

    var R = (radius === undefined) ? 6371e3 : Number(radius);
    if (!polygon[0].equals(polygon[polygon.length-1])) polygon.push(polygon[0]);
    var n = polygon.length - 1;
    console.log('n', n);
    var c = [];
    for (var v=0; v<n; v++) {
        var i = polygon[v].toVector();
        var j = polygon[v+1].toVector();
        c[v] = i.cross(j); // great circle for segment v..v+1
    }
    console.log('c', c.length, c);
    c.push(c[0]);
    var Σθ = 0;
    for (var v=0; v<n; v++) {
        console.log(v, (Math.PI-c[v].angleTo(c[v+1])).toDegrees());
        Σθ += Math.PI - c[v].angleTo(c[v+1]); // TODO: always π - α, or sometimes just α?
    }
    console.log('Σθ', Σθ.toDegrees(), ((n-2)*Math.PI).toDegrees());

    var E = (Σθ - (n-2)*Math.PI); // spherical excess (in steradians)
    var A = E * R*R;              // area (in units of radius)

    return A;
};


/**
 * Returns point representing geographic mean of supplied points.
 *
 * @param   {LatLon[]} points - Array of points to be averaged.
 * @returns {LatLon}   Point at the geographic mean of the supplied points.
 * @todo Not yet tested.
 */
LatLon.meanOf = function(points) {
    var m = new Vector3d(0, 0, 0);
    for (var p=0; p<points.length; p++) {
        m = m.plus(points[p].toVector());
    }
    return m.unit().toLatLonS();
};


/**
 * Checks if another point is equal to ‘this’ point.
 *
 * @param   {LatLon} point - Point to be compared against this point.
 * @returns {bool}    True if points are identical.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(52.205, 0.119);
 *   var equal = p1.equals(p2); // true
 */
LatLon.prototype.equals = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    if (this.lat != point.lat) return false;
    if (this.lon != point.lon) return false;

    return true;
};


/**
 * Returns a string representation of ‘this’ point.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use: default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated formatted latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
    return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/** Polyfill Math.sign for old browsers / IE */
if (Math.sign === undefined) {
    Math.sign = function(x) {
        x = +x; // convert to a number
        if (x === 0 || isNaN(x)) return x;
        return x > 0 ? 1 : -1;
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon, module.exports.Vector3d = Vector3d; // ≡ export { LatLon as default, Vector3d }

return module.exports;
}
/********** End of module 4: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/latlon-vectors.js **********/
/********** Start module 5: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/vector3d.js **********/
__modules[5] = function(module, exports) {
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vector handling functions                                          (c) Chris Veness 2011-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-vector3d.html                               */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';


/**
 * Library of 3-d vector manipulation routines.
 *
 * In a geodesy context, these vectors may be used to represent:
 *  - n-vector representing a normal to point on Earth's surface
 *  - earth-centered, earth fixed vector (≡ Gade’s ‘p-vector’)
 *  - great circle normal to vector (on spherical earth model)
 *  - motion vector on Earth's surface
 *  - etc
 *
 * Functions return vectors as return results, so that operations can be chained.
 * @example var v = v1.cross(v2).dot(v3) // ≡ v1×v2⋅v3
 *
 * @module vector3d
 */


/**
 * Creates a 3-d vector.
 *
 * The vector may be normalised, or use x/y/z values for eg height relative to the sphere or
 * ellipsoid, distance from earth centre, etc.
 *
 * @constructor
 * @param {number} x - X component of vector.
 * @param {number} y - Y component of vector.
 * @param {number} z - Z component of vector.
 */
function Vector3d(x, y, z) {
    if (!(this instanceof Vector3d)) return new Vector3d(x, y, z);

    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
}


/**
 * Adds supplied vector to ‘this’ vector.
 *
 * @param   {Vector3d} v - Vector to be added to this vector.
 * @returns {Vector3d} Vector representing sum of this and v.
 */
Vector3d.prototype.plus = function(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    return new Vector3d(this.x + v.x, this.y + v.y, this.z + v.z);
};


/**
 * Subtracts supplied vector from ‘this’ vector.
 *
 * @param   {Vector3d} v - Vector to be subtracted from this vector.
 * @returns {Vector3d} Vector representing difference between this and v.
 */
Vector3d.prototype.minus = function(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    return new Vector3d(this.x - v.x, this.y - v.y, this.z - v.z);
};


/**
 * Multiplies ‘this’ vector by a scalar value.
 *
 * @param   {number}   x - Factor to multiply this vector by.
 * @returns {Vector3d} Vector scaled by x.
 */
Vector3d.prototype.times = function(x) {
    x = Number(x);

    return new Vector3d(this.x * x, this.y * x, this.z * x);
};


/**
 * Divides ‘this’ vector by a scalar value.
 *
 * @param   {number}   x - Factor to divide this vector by.
 * @returns {Vector3d} Vector divided by x.
 */
Vector3d.prototype.dividedBy = function(x) {
    x = Number(x);

    return new Vector3d(this.x / x, this.y / x, this.z / x);
};


/**
 * Multiplies ‘this’ vector by the supplied vector using dot (scalar) product.
 *
 * @param   {Vector3d} v - Vector to be dotted with this vector.
 * @returns {number} Dot product of ‘this’ and v.
 */
Vector3d.prototype.dot = function(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    return this.x*v.x + this.y*v.y + this.z*v.z;
};


/**
 * Multiplies ‘this’ vector by the supplied vector using cross (vector) product.
 *
 * @param   {Vector3d} v - Vector to be crossed with this vector.
 * @returns {Vector3d} Cross product of ‘this’ and v.
 */
Vector3d.prototype.cross = function(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    var x = this.y*v.z - this.z*v.y;
    var y = this.z*v.x - this.x*v.z;
    var z = this.x*v.y - this.y*v.x;

    return new Vector3d(x, y, z);
};


/**
 * Negates a vector to point in the opposite direction
 *
 * @returns {Vector3d} Negated vector.
 */
Vector3d.prototype.negate = function() {
    return new Vector3d(-this.x, -this.y, -this.z);
};


/**
 * Length (magnitude or norm) of ‘this’ vector
 *
 * @returns {number} Magnitude of this vector.
 */
Vector3d.prototype.length = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};


/**
 * Normalizes a vector to its unit vector
 * – if the vector is already unit or is zero magnitude, this is a no-op.
 *
 * @returns {Vector3d} Normalised version of this vector.
 */
Vector3d.prototype.unit = function() {
    var norm = this.length();
    if (norm == 1) return this;
    if (norm == 0) return this;

    var x = this.x/norm;
    var y = this.y/norm;
    var z = this.z/norm;

    return new Vector3d(x, y, z);
};


/**
 * Calculates the angle between ‘this’ vector and supplied vector.
 *
 * @param   {Vector3d} v
 * @param   {Vector3d} [vSign] - If supplied (and out of plane of this and v), angle is signed +ve if
 *     this->v is clockwise looking along vSign, -ve in opposite direction (otherwise unsigned angle).
 * @returns {number} Angle (in radians) between this vector and supplied vector.
 */
Vector3d.prototype.angleTo = function(v, vSign) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    var sinθ = this.cross(v).length();
    var cosθ = this.dot(v);

    if (vSign !== undefined) {
        if (!(vSign instanceof Vector3d)) throw new TypeError('vSign is not Vector3d object');
        sinθ = this.cross(v).dot(vSign)<0 ? -sinθ : sinθ;
    }

    return Math.atan2(sinθ, cosθ);
};


/**
 * Rotates ‘this’ point around an axis by a specified angle.
 *
 * @param   {Vector3d} axis - The axis being rotated around.
 * @param   {number}   theta - The angle of rotation (in radians).
 * @returns {Vector3d} The rotated point.
 */
Vector3d.prototype.rotateAround = function(axis, theta) {
    if (!(axis instanceof Vector3d)) throw new TypeError('axis is not Vector3d object');
    var p1 = this.unit();
    var p = [ p1.x, p1.y, p1.z ]; // the point being rotated
    var a = axis.unit();          // the axis being rotated around
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    var q = [
        [ a.x*a.x*(1-c) + c,     a.x*a.y*(1-c) - a.z*s, a.x*a.z*(1-c) + a.y*s],
        [ a.y*a.x*(1-c) + a.z*s, a.y*a.y*(1-c) + c,     a.y*a.z*(1-c) - a.x*s],
        [ a.z*a.x*(1-c) - a.y*s, a.z*a.y*(1-c) + a.x*s, a.z*a.z*(1-c) + c    ],
    ];
    var qp = [0, 0, 0];
    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            qp[i] += q[i][j] * p[j];
        }
    }
    var p2 = new Vector3d(qp[0], qp[1], qp[2]);
    return p2;
};


/**
 * String representation of vector.
 *
 * @param   {number} [precision=3] - Number of decimal places to be used.
 * @returns {string} Vector represented as [x,y,z].
 */
Vector3d.prototype.toString = function(precision) {
    var p = (precision === undefined) ? 3 : Number(precision);

    var str = '[' + this.x.toFixed(p) + ',' + this.y.toFixed(p) + ',' + this.z.toFixed(p) + ']';

    return str;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Vector3d; // ≡ export default Vector3d

return module.exports;
}
/********** End of module 5: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/vector3d.js **********/
/********** Start module 6: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/utm.js **********/
__modules[6] = function(module, exports) {
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* UTM / WGS-84 Conversion Functions                                  (c) Chris Veness 2014-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-utm-mgrs.html                                           */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-utm.html                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var LatLon = __require(2,6); // ≡ import LatLon from 'latlon-ellipsoidal.js'


/**
 * Convert between Universal Transverse Mercator coordinates and WGS 84 latitude/longitude points.
 *
 * Method based on Karney 2011 ‘Transverse Mercator with an accuracy of a few nanometers’,
 * building on Krüger 1912 ‘Konforme Abbildung des Erdellipsoids in der Ebene’.
 *
 * @module   utm
 * @requires latlon-ellipsoidal
 */


/**
 * Creates a Utm coordinate object.
 *
 * @constructor
 * @param  {number} zone - UTM 6° longitudinal zone (1..60 covering 180°W..180°E).
 * @param  {string} hemisphere - N for northern hemisphere, S for southern hemisphere.
 * @param  {number} easting - Easting in metres from false easting (-500km from central meridian).
 * @param  {number} northing - Northing in metres from equator (N) or from false northing -10,000km (S).
 * @param  {LatLon.datum} [datum=WGS84] - Datum UTM coordinate is based on.
 * @param  {number} [convergence] - Meridian convergence (bearing of grid north clockwise from true
 *                  north), in degrees
 * @param  {number} [scale] - Grid scale factor
 * @throws {Error}  Invalid UTM coordinate
 *
 * @example
 *   var utmCoord = new Utm(31, 'N', 448251, 5411932);
 */
function Utm(zone, hemisphere, easting, northing, datum, convergence, scale) {
    if (!(this instanceof Utm)) { // allow instantiation without 'new'
        return new Utm(zone, hemisphere, easting, northing, datum, convergence, scale);
    }

    if (datum === undefined) datum = LatLon.datum.WGS84; // default if not supplied
    if (convergence === undefined) convergence = null;   // default if not supplied
    if (scale === undefined) scale = null;               // default if not supplied

    if (!(1<=zone && zone<=60)) throw new Error('Invalid UTM zone '+zone);
    if (!hemisphere.match(/[NS]/i)) throw new Error('Invalid UTM hemisphere '+hemisphere);

    this.zone = Number(zone);
    this.hemisphere = hemisphere.toUpperCase();
    this.easting = Number(easting);
    this.northing = Number(northing);
    this.datum = datum;
    this.convergence = convergence===null ? null : Number(convergence);
    this.scale = scale===null ? null : Number(scale);
}


/**
 * Converts latitude/longitude to UTM coordinate.
 *
 * Implements Karney’s method, using Krüger series to order n^6, giving results accurate to 5nm for
 * distances up to 3900km from the central meridian.
 *
 * @returns {Utm}   UTM coordinate.
 * @throws  {Error} If point not valid, if point outside latitude range.
 *
 * @example
 *   var latlong = new LatLon(48.8582, 2.2945);
 *   var utmCoord = latlong.toUtm(); // utmCoord.toString(): '31 N 448252 5411933'
 */
LatLon.prototype.toUtm = function() {
    if (isNaN(this.lat) || isNaN(this.lon)) throw new Error('Invalid point');
    if (!(-80<this.lat && this.lat<84)) throw new Error('Outside UTM limits ('+this.lat+','+this.lon+')');

    var falseEasting = 500e3, falseNorthing = 10000e3;

    var zone = Math.floor((this.lon+180)/6) + 1; // longitudinal zone
    var λ0 = ((zone-1)*6 - 180 + 3).toRadians(); // longitude of central meridian
    var mgrsLatBands = 'CDEFGHJKLMNPQRSTUVWXX'; // X is repeated for 80-84°N
    var latBand = mgrsLatBands.charAt(Math.floor(this.lat/8+10));
    if (zone==31 && latBand=='V' && this.lon>= 3) { zone++; λ0 += (6).toRadians(); }
    if (zone==32 && latBand=='X' && this.lon<  9) { zone--; λ0 -= (6).toRadians(); }
    if (zone==32 && latBand=='X' && this.lon>= 9) { zone++; λ0 += (6).toRadians(); }
    if (zone==34 && latBand=='X' && this.lon< 21) { zone--; λ0 -= (6).toRadians(); }
    if (zone==34 && latBand=='X' && this.lon>=21) { zone++; λ0 += (6).toRadians(); }
    if (zone==36 && latBand=='X' && this.lon< 33) { zone--; λ0 -= (6).toRadians(); }
    if (zone==36 && latBand=='X' && this.lon>=33) { zone++; λ0 += (6).toRadians(); }

    var φ = this.lat.toRadians();      // latitude ± from equator
    var λ = this.lon.toRadians() - λ0; // longitude ± from central meridian

    var a = this.datum.ellipsoid.a, f = this.datum.ellipsoid.f;

    var k0 = 0.9996; // UTM scale on the central meridian

    var e = Math.sqrt(f*(2-f)); // eccentricity
    var n = f / (2 - f);        // 3rd flattening
    var n2 = n*n, n3 = n*n2, n4 = n*n3, n5 = n*n4, n6 = n*n5; // TODO: compare Horner-form accuracy?

    var cosλ = Math.cos(λ), sinλ = Math.sin(λ), tanλ = Math.tan(λ);

    var τ = Math.tan(φ); // τ ≡ tanφ, τʹ ≡ tanφʹ; prime (ʹ) indicates angles on the conformal sphere
    var σ = Math.sinh(e*Math.atanh(e*τ/Math.sqrt(1+τ*τ)));

    var τʹ = τ*Math.sqrt(1+σ*σ) - σ*Math.sqrt(1+τ*τ);

    var ξʹ = Math.atan2(τʹ, cosλ);
    var ηʹ = Math.asinh(sinλ / Math.sqrt(τʹ*τʹ + cosλ*cosλ));

    var A = a/(1+n) * (1 + 1/4*n2 + 1/64*n4 + 1/256*n6); // 2πA is the circumference of a meridian

    var α = [ null, // note α is one-based array (6th order Krüger expressions)
        1/2*n - 2/3*n2 + 5/16*n3 +   41/180*n4 -     127/288*n5 +      7891/37800*n6,
              13/48*n2 -  3/5*n3 + 557/1440*n4 +     281/630*n5 - 1983433/1935360*n6,
                       61/240*n3 -  103/140*n4 + 15061/26880*n5 +   167603/181440*n6,
                               49561/161280*n4 -     179/168*n5 + 6601661/7257600*n6,
                                                 34729/80640*n5 - 3418889/1995840*n6,
                                                              212378941/319334400*n6 ];

    var ξ = ξʹ;
    for (var j=1; j<=6; j++) ξ += α[j] * Math.sin(2*j*ξʹ) * Math.cosh(2*j*ηʹ);

    var η = ηʹ;
    for (var j=1; j<=6; j++) η += α[j] * Math.cos(2*j*ξʹ) * Math.sinh(2*j*ηʹ);

    var x = k0 * A * η;
    var y = k0 * A * ξ;

    var pʹ = 1;
    for (var j=1; j<=6; j++) pʹ += 2*j*α[j] * Math.cos(2*j*ξʹ) * Math.cosh(2*j*ηʹ);
    var qʹ = 0;
    for (var j=1; j<=6; j++) qʹ += 2*j*α[j] * Math.sin(2*j*ξʹ) * Math.sinh(2*j*ηʹ);

    var γʹ = Math.atan(τʹ / Math.sqrt(1+τʹ*τʹ)*tanλ);
    var γʺ = Math.atan2(qʹ, pʹ);

    var γ = γʹ + γʺ;

    var sinφ = Math.sin(φ);
    var kʹ = Math.sqrt(1 - e*e*sinφ*sinφ) * Math.sqrt(1 + τ*τ) / Math.sqrt(τʹ*τʹ + cosλ*cosλ);
    var kʺ = A / a * Math.sqrt(pʹ*pʹ + qʹ*qʹ);

    var k = k0 * kʹ * kʺ;
    x = x + falseEasting;             // make x relative to false easting
    if (y < 0) y = y + falseNorthing; // make y in southern hemisphere relative to false northing
    x = Number(x.toFixed(6)); // nm precision
    y = Number(y.toFixed(6)); // nm precision
    var convergence = Number(γ.toDegrees().toFixed(9));
    var scale = Number(k.toFixed(12));

    var h = this.lat>=0 ? 'N' : 'S'; // hemisphere

    return new Utm(zone, h, x, y, this.datum, convergence, scale);
};


/**
 * Converts UTM zone/easting/northing coordinate to latitude/longitude
 *
 * @param   {Utm}    utmCoord - UTM coordinate to be converted to latitude/longitude.
 * @returns {LatLon} Latitude/longitude of supplied grid reference.
 *
 * @example
 *   var grid = new Utm(31, 'N', 448251.795, 5411932.678);
 *   var latlong = grid.toLatLonE(); // latlong.toString(): 48°51′29.52″N, 002°17′40.20″E
 */
Utm.prototype.toLatLonE = function() {
    var z = this.zone;
    var h = this.hemisphere;
    var x = this.easting;
    var y = this.northing;

    if (isNaN(z) || isNaN(x) || isNaN(y)) throw new Error('Invalid coordinate');

    var falseEasting = 500e3, falseNorthing = 10000e3;

    var a = this.datum.ellipsoid.a, f = this.datum.ellipsoid.f;

    var k0 = 0.9996; // UTM scale on the central meridian

    x = x - falseEasting;               // make x ± relative to central meridian
    y = h=='S' ? y - falseNorthing : y; // make y ± relative to equator

    var e = Math.sqrt(f*(2-f)); // eccentricity
    var n = f / (2 - f);        // 3rd flattening
    var n2 = n*n, n3 = n*n2, n4 = n*n3, n5 = n*n4, n6 = n*n5;

    var A = a/(1+n) * (1 + 1/4*n2 + 1/64*n4 + 1/256*n6); // 2πA is the circumference of a meridian

    var η = x / (k0*A);
    var ξ = y / (k0*A);

    var β = [ null, // note β is one-based array (6th order Krüger expressions)
        1/2*n - 2/3*n2 + 37/96*n3 -    1/360*n4 -   81/512*n5 +    96199/604800*n6,
               1/48*n2 +  1/15*n3 - 437/1440*n4 +   46/105*n5 - 1118711/3870720*n6,
                        17/480*n3 -   37/840*n4 - 209/4480*n5 +      5569/90720*n6,
                                 4397/161280*n4 -   11/504*n5 -  830251/7257600*n6,
                                               4583/161280*n5 -  108847/3991680*n6,
                                                             20648693/638668800*n6 ];

    var ξʹ = ξ;
    for (var j=1; j<=6; j++) ξʹ -= β[j] * Math.sin(2*j*ξ) * Math.cosh(2*j*η);

    var ηʹ = η;
    for (var j=1; j<=6; j++) ηʹ -= β[j] * Math.cos(2*j*ξ) * Math.sinh(2*j*η);

    var sinhηʹ = Math.sinh(ηʹ);
    var sinξʹ = Math.sin(ξʹ), cosξʹ = Math.cos(ξʹ);

    var τʹ = sinξʹ / Math.sqrt(sinhηʹ*sinhηʹ + cosξʹ*cosξʹ);

    var τi = τʹ;
    do {
        var σi = Math.sinh(e*Math.atanh(e*τi/Math.sqrt(1+τi*τi)));
        var τiʹ = τi * Math.sqrt(1+σi*σi) - σi * Math.sqrt(1+τi*τi);
        var δτi = (τʹ - τiʹ)/Math.sqrt(1+τiʹ*τiʹ)
            * (1 + (1-e*e)*τi*τi) / ((1-e*e)*Math.sqrt(1+τi*τi));
        τi += δτi;
    } while (Math.abs(δτi) > 1e-12); // using IEEE 754 δτi -> 0 after 2-3 iterations
    var τ = τi;

    var φ = Math.atan(τ);

    var λ = Math.atan2(sinhηʹ, cosξʹ);

    var p = 1;
    for (var j=1; j<=6; j++) p -= 2*j*β[j] * Math.cos(2*j*ξ) * Math.cosh(2*j*η);
    var q = 0;
    for (var j=1; j<=6; j++) q += 2*j*β[j] * Math.sin(2*j*ξ) * Math.sinh(2*j*η);

    var γʹ = Math.atan(Math.tan(ξʹ) * Math.tanh(ηʹ));
    var γʺ = Math.atan2(q, p);

    var γ = γʹ + γʺ;

    var sinφ = Math.sin(φ);
    var kʹ = Math.sqrt(1 - e*e*sinφ*sinφ) * Math.sqrt(1 + τ*τ) * Math.sqrt(sinhηʹ*sinhηʹ + cosξʹ*cosξʹ);
    var kʺ = A / a / Math.sqrt(p*p + q*q);

    var k = k0 * kʹ * kʺ;

    var λ0 = ((z-1)*6 - 180 + 3).toRadians(); // longitude of central meridian
    λ += λ0; // move λ from zonal to global coordinates
    var lat = Number(φ.toDegrees().toFixed(11)); // nm precision (1nm = 10^-11°)
    var lon = Number(λ.toDegrees().toFixed(11)); // (strictly lat rounding should be φ⋅cosφ!)
    var convergence = Number(γ.toDegrees().toFixed(9));
    var scale = Number(k.toFixed(12));

    var latLong = new LatLon(lat, lon, this.datum);
    latLong.convergence = convergence;
    latLong.scale = scale;

    return latLong;
};


/**
 * Parses string representation of UTM coordinate.
 *
 * A UTM coordinate comprises (space-separated)
 *  - zone
 *  - hemisphere
 *  - easting
 *  - northing.
 *
 * @param   {string} utmCoord - UTM coordinate (WGS 84).
 * @param   {Datum}  [datum=WGS84] - Datum coordinate is defined in (default WGS 84).
 * @returns {Utm}
 * @throws  {Error}  Invalid UTM coordinate.
 *
 * @example
 *   var utmCoord = Utm.parse('31 N 448251 5411932');
 *   // utmCoord: {zone: 31, hemisphere: 'N', easting: 448251, northing: 5411932 }
 */
Utm.parse = function(utmCoord, datum) {
    if (datum === undefined) datum = LatLon.datum.WGS84; // default if not supplied
    utmCoord = utmCoord.trim().match(/\S+/g);

    if (utmCoord==null || utmCoord.length!=4) throw new Error('Invalid UTM coordinate ‘'+utmCoord+'’');

    var zone = utmCoord[0], hemisphere = utmCoord[1], easting = utmCoord[2], northing = utmCoord[3];

    return new Utm(zone, hemisphere, easting, northing, datum);
};


/**
 * Returns a string representation of a UTM coordinate.
 *
 * To distinguish from MGRS grid zone designators, a space is left between the zone and the
 * hemisphere.
 *
 * Note that UTM coordinates get rounded, not truncated (unlike MGRS grid references).
 *
 * @param   {number} [digits=0] - Number of digits to appear after the decimal point (3 ≡ mm).
 * @returns {string} A string representation of the coordinate.
 *
 * @example
 *   var utm = Utm.parse('31 N 448251 5411932').toString(4);  // 31 N 448251.0000 5411932.0000
 */
Utm.prototype.toString = function(digits) {
    digits = Number(digits||0); // default 0 if not supplied

    var z = this.zone<10 ? '0'+this.zone : this.zone; // leading zero
    var h = this.hemisphere;
    var e = this.easting;
    var n = this.northing;
    if (isNaN(z) || !h.match(/[NS]/) || isNaN(e) || isNaN(n)) return '';

    return z+' '+h+' '+e.toFixed(digits)+' '+n.toFixed(digits);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Polyfill Math.sinh for old browsers / IE */
if (Math.sinh === undefined) {
    Math.sinh = function(x) {
        return (Math.exp(x) - Math.exp(-x)) / 2;
    };
}

/** Polyfill Math.cosh for old browsers / IE */
if (Math.cosh === undefined) {
    Math.cosh = function(x) {
        return (Math.exp(x) + Math.exp(-x)) / 2;
    };
}

/** Polyfill Math.tanh for old browsers / IE */
if (Math.tanh === undefined) {
    Math.tanh = function(x) {
        return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
    };
}

/** Polyfill Math.asinh for old browsers / IE */
if (Math.asinh === undefined) {
    Math.asinh = function(x) {
        return Math.log(x + Math.sqrt(1 + x*x));
    };
}

/** Polyfill Math.atanh for old browsers / IE */
if (Math.atanh === undefined) {
    Math.atanh = function(x) {
        return Math.log((1+x) / (1-x)) / 2;
    };
}

/** Polyfill String.trim for old browsers
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (String.prototype.trim === undefined) {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Utm; // ≡ export default Utm

return module.exports;
}
/********** End of module 6: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/utm.js **********/
/********** Start module 7: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/mgrs.js **********/
__modules[7] = function(module, exports) {
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  MGRS / UTM Conversion Functions                                   (c) Chris Veness 2014-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-utm-mgrs.html                                           */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-mgrs.html                                   */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var Utm = __require(6,7);                   // ≡ import Utm from 'utm.js'
if (typeof module!='undefined' && module.exports) var LatLon = __require(2,7); // ≡ import LatLon from 'latlon-ellipsoidal.js'


/**
 * Convert between Universal Transverse Mercator (UTM) coordinates and Military Grid Reference
 * System (MGRS/NATO) grid references.
 *
 * @module   mgrs
 * @requires utm
 * @requires latlon-ellipsoidal
 */

/* qv www.fgdc.gov/standards/projects/FGDC-standards-projects/usng/fgdc_std_011_2001_usng.pdf p10 */


/*
 * Latitude bands C..X 8° each, covering 80°S to 84°N
 */
Mgrs.latBands = 'CDEFGHJKLMNPQRSTUVWXX'; // X is repeated for 80-84°N


/*
 * 100km grid square column (‘e’) letters repeat every third zone
 */
Mgrs.e100kLetters = [ 'ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ' ];


/*
 * 100km grid square row (‘n’) letters repeat every other zone
 */
Mgrs.n100kLetters = ['ABCDEFGHJKLMNPQRSTUV', 'FGHJKLMNPQRSTUVABCDE'];


/**
 * Creates an Mgrs grid reference object.
 *
 * @constructor
 * @param  {number} zone - 6° longitudinal zone (1..60 covering 180°W..180°E).
 * @param  {string} band - 8° latitudinal band (C..X covering 80°S..84°N).
 * @param  {string} e100k - First letter (E) of 100km grid square.
 * @param  {string} n100k - Second letter (N) of 100km grid square.
 * @param  {number} easting - Easting in metres within 100km grid square.
 * @param  {number} northing - Northing in metres within 100km grid square.
 * @param  {LatLon.datum} [datum=WGS84] - Datum UTM coordinate is based on.
 * @throws {Error}  Invalid MGRS grid reference.
 *
 * @example
 *   var mgrsRef = new Mgrs(31, 'U', 'D', 'Q', 48251, 11932); // 31U DQ 48251 11932
 */
function Mgrs(zone, band, e100k, n100k, easting, northing, datum) {
    if (!(this instanceof Mgrs)) return new Mgrs(zone, band, e100k, n100k, easting, northing, datum);

    if (datum === undefined) datum = LatLon.datum.WGS84; // default if not supplied

    if (!(1<=zone && zone<=60)) throw new Error('Invalid MGRS grid reference (zone ‘'+zone+'’)');
    if (band.length != 1) throw new Error('Invalid MGRS grid reference (band ‘'+band+'’)');
    if (Mgrs.latBands.indexOf(band) == -1) throw new Error('Invalid MGRS grid reference (band ‘'+band+'’)');
    if (e100k.length!=1) throw new Error('Invalid MGRS grid reference (e100k ‘'+e100k+'’)');
    if (n100k.length!=1) throw new Error('Invalid MGRS grid reference (n100k ‘'+n100k+'’)');

    this.zone = Number(zone);
    this.band = band;
    this.e100k = e100k;
    this.n100k = n100k;
    this.easting = Number(easting);
    this.northing = Number(northing);
    this.datum = datum;
}


/**
 * Converts UTM coordinate to MGRS reference.
 *
 * @returns {Mgrs}
 * @throws  {Error} Invalid UTM coordinate.
 *
 * @example
 *   var utmCoord = new Utm(31, 'N', 448251, 5411932);
 *   var mgrsRef = utmCoord.toMgrs(); // 31U DQ 48251 11932
 */
Utm.prototype.toMgrs = function() {
    if (isNaN(this.zone + this.easting + this.northing)) throw new Error('Invalid UTM coordinate ‘'+this.toString()+'’');
    var zone = this.zone;
    var latlong = this.toLatLonE();
    var band = Mgrs.latBands.charAt(Math.floor(latlong.lat/8+10)); // latitude band
    var col = Math.floor(this.easting / 100e3);
    var e100k = Mgrs.e100kLetters[(zone-1)%3].charAt(col-1); // col-1 since 1*100e3 -> A (index 0), 2*100e3 -> B (index 1), etc.
    var row = Math.floor(this.northing / 100e3) % 20;
    var n100k = Mgrs.n100kLetters[(zone-1)%2].charAt(row);
    var easting = this.easting % 100e3;
    var northing = this.northing % 100e3;
    easting = Number(easting.toFixed(6));
    northing = Number(northing.toFixed(6));

    return new Mgrs(zone, band, e100k, n100k, easting, northing);
};


/**
 * Converts MGRS grid reference to UTM coordinate.
 *
 * @returns {Utm}
 *
 * @example
 *   var utmCoord = Mgrs.parse('31U DQ 448251 11932').toUtm(); // 31 N 448251 5411932
 */
Mgrs.prototype.toUtm = function() {
    var zone = this.zone;
    var band = this.band;
    var e100k = this.e100k;
    var n100k = this.n100k;
    var easting = this.easting;
    var northing = this.northing;

    var hemisphere = band>='N' ? 'N' : 'S';
    var col = Mgrs.e100kLetters[(zone-1)%3].indexOf(e100k) + 1; // index+1 since A (index 0) -> 1*100e3, B (index 1) -> 2*100e3, etc.
    var e100kNum = col * 100e3; // e100k in metres
    var row = Mgrs.n100kLetters[(zone-1)%2].indexOf(n100k);
    var n100kNum = row * 100e3; // n100k in metres
    var latBand = (Mgrs.latBands.indexOf(band)-10)*8;
    var nBand = Math.floor(new LatLon(latBand, 0).toUtm().northing/100e3)*100e3;
    var n2M = 0; // northing of 2,000km block
    while (n2M + n100kNum + northing < nBand) n2M += 2000e3;

    return new Utm(zone, hemisphere, e100kNum+easting, n2M+n100kNum+northing, this.datum);
};


/**
 * Parses string representation of MGRS grid reference.
 *
 * An MGRS grid reference comprises (space-separated)
 *  - grid zone designator (GZD)
 *  - 100km grid square letter-pair
 *  - easting
 *  - northing.
 *
 * @param   {string} mgrsGridRef - String representation of MGRS grid reference.
 * @returns {Mgrs}   Mgrs grid reference object.
 * @throws  {Error}  Invalid MGRS grid reference.
 *
 * @example
 *   var mgrsRef = Mgrs.parse('31U DQ 48251 11932');
 *   var mgrsRef = Mgrs.parse('31UDQ4825111932');
 *   //  mgrsRef: { zone:31, band:'U', e100k:'D', n100k:'Q', easting:48251, northing:11932 }
 */
Mgrs.parse = function(mgrsGridRef) {
    mgrsGridRef = mgrsGridRef.trim();
    if (!mgrsGridRef.match(/\s/)) {
        var en = mgrsGridRef.slice(5); // get easting/northing following zone/band/100ksq
        en = en.slice(0, en.length/2)+' '+en.slice(-en.length/2); // separate easting/northing
        mgrsGridRef = mgrsGridRef.slice(0, 3)+' '+mgrsGridRef.slice(3, 5)+' '+en; // insert spaces
    }
    mgrsGridRef = mgrsGridRef.match(/\S+/g);

    if (mgrsGridRef==null || mgrsGridRef.length!=4) throw new Error('Invalid MGRS grid reference ‘'+mgrsGridRef+'’');
    var gzd = mgrsGridRef[0];
    var zone = gzd.slice(0, 2);
    var band = gzd.slice(2, 3);
    var en100k = mgrsGridRef[1];
    var e100k = en100k.slice(0, 1);
    var n100k = en100k.slice(1, 2);

    var e = mgrsGridRef[2], n = mgrsGridRef[3];
    e = e.length>=5 ?  e : (e+'00000').slice(0, 5);
    n = n.length>=5 ?  n : (n+'00000').slice(0, 5);

    return new Mgrs(zone, band, e100k, n100k, e, n);
};


/**
 * Returns a string representation of an MGRS grid reference.
 *
 * To distinguish from civilian UTM coordinate representations, no space is included within the
 * zone/band grid zone designator.
 *
 * Components are separated by spaces: for a military-style unseparated string, use
 * Mgrs.toString().replace(/ /g, '');
 *
 * Note that MGRS grid references get truncated, not rounded (unlike UTM coordinates).
 *
 * @param   {number} [digits=10] - Precision of returned grid reference (eg 4 = km, 10 = m).
 * @returns {string} This grid reference in standard format.
 * @throws  {Error}  Invalid precision.
 *
 * @example
 *   var mgrsStr = new Mgrs(31, 'U', 'D', 'Q', 48251, 11932).toString(); // '31U DQ 48251 11932'
 */
Mgrs.prototype.toString = function(digits) {
    digits = (digits === undefined) ? 10 : Number(digits);
    if ([2,4,6,8,10].indexOf(digits) == -1) throw new Error('Invalid precision ‘'+digits+'’');

    var zone = this.zone.pad(2); // ensure leading zero
    var band = this.band;

    var e100k = this.e100k;
    var n100k = this.n100k;
    var easting = Math.floor(this.easting/Math.pow(10, 5-digits/2));
    var northing = Math.floor(this.northing/Math.pow(10, 5-digits/2));
    easting = easting.pad(digits/2);
    northing = northing.pad(digits/2);

    return zone+band + ' ' + e100k+n100k + ' '  + easting + ' ' + northing;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to pad with leading zeros to make it w chars wide
 *  (q.v. stackoverflow.com/questions/2998784 */
if (Number.prototype.pad === undefined) {
    Number.prototype.pad = function(w) {
        var n = this.toString();
        while (n.length < w) n = '0' + n;
        return n;
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Mgrs; // ≡ export default Mgrs

return module.exports;
}
/********** End of module 7: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/mgrs.js **********/
/********** Start module 8: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/osgridref.js **********/
__modules[8] = function(module, exports) {
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Ordnance Survey Grid Reference functions                           (c) Chris Veness 2005-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-gridref.html                                            */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-osgridref.html                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var LatLon = __require(2,8); // ≡ import LatLon from 'latlon-ellipsoidal.js'


/**
 * Convert OS grid references to/from OSGB latitude/longitude points.
 *
 * Formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is inferior
 * to Krüger as used by e.g. Karney 2011.
 *
 * www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf.
 *
 * @module   osgridref
 * @requires latlon-ellipsoidal
 */
/*
 * Converted 2015 to work with WGS84 by default, OSGB36 as option;
 * www.ordnancesurvey.co.uk/blog/2014/12/confirmation-on-changes-to-latitude-and-longitude
 */


/**
 * Creates an OsGridRef object.
 *
 * @constructor
 * @param {number} easting - Easting in metres from OS false origin.
 * @param {number} northing - Northing in metres from OS false origin.
 *
 * @example
 *   var grid = new OsGridRef(651409, 313177);
 */
function OsGridRef(easting, northing) {
    if (!(this instanceof OsGridRef)) return new OsGridRef(easting, northing);

    this.easting = Number(easting);
    this.northing = Number(northing);
}


/**
 * Converts latitude/longitude to Ordnance Survey grid reference easting/northing coordinate.
 *
 * Note formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is
 * inferior to Krüger as used by e.g. Karney 2011.
 *
 * @param   {LatLon}    point - latitude/longitude.
 * @returns {OsGridRef} OS Grid Reference easting/northing.
 *
 * @example
 *   var p = new LatLon(52.65798, 1.71605);
 *   var grid = OsGridRef.latLonToOsGrid(p); // grid.toString(): TG 51409 13177
 *   // for conversion of (historical) OSGB36 latitude/longitude point:
 *   var p = new LatLon(52.65757, 1.71791, LatLon.datum.OSGB36);
 */
OsGridRef.latLonToOsGrid = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    if (point.datum != LatLon.datum.OSGB36) point = point.convertDatum(LatLon.datum.OSGB36);

    var φ = point.lat.toRadians();
    var λ = point.lon.toRadians();

    var a = 6377563.396, b = 6356256.909;              // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717;                             // NatGrid scale factor on central meridian
    var φ0 = (49).toRadians(), λ0 = (-2).toRadians();  // NatGrid true origin is 49°N,2°W
    var N0 = -100000, E0 = 400000;                     // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var cosφ = Math.cos(φ), sinφ = Math.sin(φ);
    var ν = a*F0/Math.sqrt(1-e2*sinφ*sinφ);            // nu = transverse radius of curvature
    var ρ = a*F0*(1-e2)/Math.pow(1-e2*sinφ*sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν/ρ-1;                                    // eta = ?

    var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (φ-φ0);
    var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(φ-φ0) * Math.cos(φ+φ0);
    var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(φ-φ0)) * Math.cos(2*(φ+φ0));
    var Md = (35/24)*n3 * Math.sin(3*(φ-φ0)) * Math.cos(3*(φ+φ0));
    var M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    var cos3φ = cosφ*cosφ*cosφ;
    var cos5φ = cos3φ*cosφ*cosφ;
    var tan2φ = Math.tan(φ)*Math.tan(φ);
    var tan4φ = tan2φ*tan2φ;

    var I = M + N0;
    var II = (ν/2)*sinφ*cosφ;
    var III = (ν/24)*sinφ*cos3φ*(5-tan2φ+9*η2);
    var IIIA = (ν/720)*sinφ*cos5φ*(61-58*tan2φ+tan4φ);
    var IV = ν*cosφ;
    var V = (ν/6)*cos3φ*(ν/ρ-tan2φ);
    var VI = (ν/120) * cos5φ * (5 - 18*tan2φ + tan4φ + 14*η2 - 58*tan2φ*η2);

    var Δλ = λ-λ0;
    var Δλ2 = Δλ*Δλ, Δλ3 = Δλ2*Δλ, Δλ4 = Δλ3*Δλ, Δλ5 = Δλ4*Δλ, Δλ6 = Δλ5*Δλ;

    var N = I + II*Δλ2 + III*Δλ4 + IIIA*Δλ6;
    var E = E0 + IV*Δλ + V*Δλ3 + VI*Δλ5;

    N = Number(N.toFixed(3)); // round to mm precision
    E = Number(E.toFixed(3));

    return new OsGridRef(E, N); // gets truncated to SW corner of 1m grid square
};


/**
 * Converts Ordnance Survey grid reference easting/northing coordinate to latitude/longitude
 * (SW corner of grid square).
 *
 * Note formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is
 * inferior to Krüger as used by e.g. Karney 2011.
 *
 * @param   {OsGridRef}    gridref - Grid ref E/N to be converted to lat/long (SW corner of grid square).
 * @param   {LatLon.datum} [datum=WGS84] - Datum to convert grid reference into.
 * @returns {LatLon}       Latitude/longitude of supplied grid reference.
 *
 * @example
 *   var gridref = new OsGridRef(651409.903, 313177.270);
 *   var pWgs84 = OsGridRef.osGridToLatLon(gridref);                     // 52°39′28.723″N, 001°42′57.787″E
 *   // to obtain (historical) OSGB36 latitude/longitude point:
 *   var pOsgb = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36); // 52°39′27.253″N, 001°43′04.518″E
 */
OsGridRef.osGridToLatLon = function(gridref, datum) {
    if (!(gridref instanceof OsGridRef)) throw new TypeError('gridref is not OsGridRef object');
    if (datum === undefined) datum = LatLon.datum.WGS84;

    var E = gridref.easting;
    var N = gridref.northing;

    var a = 6377563.396, b = 6356256.909;              // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717;                             // NatGrid scale factor on central meridian
    var φ0 = (49).toRadians(), λ0 = (-2).toRadians();  // NatGrid true origin is 49°N,2°W
    var N0 = -100000, E0 = 400000;                     // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var φ=φ0, M=0;
    do {
        φ = (N-N0-M)/(a*F0) + φ;

        var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (φ-φ0);
        var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(φ-φ0) * Math.cos(φ+φ0);
        var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(φ-φ0)) * Math.cos(2*(φ+φ0));
        var Md = (35/24)*n3 * Math.sin(3*(φ-φ0)) * Math.cos(3*(φ+φ0));
        M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    } while (N-N0-M >= 0.00001);  // ie until < 0.01mm

    var cosφ = Math.cos(φ), sinφ = Math.sin(φ);
    var ν = a*F0/Math.sqrt(1-e2*sinφ*sinφ);            // nu = transverse radius of curvature
    var ρ = a*F0*(1-e2)/Math.pow(1-e2*sinφ*sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν/ρ-1;                                    // eta = ?

    var tanφ = Math.tan(φ);
    var tan2φ = tanφ*tanφ, tan4φ = tan2φ*tan2φ, tan6φ = tan4φ*tan2φ;
    var secφ = 1/cosφ;
    var ν3 = ν*ν*ν, ν5 = ν3*ν*ν, ν7 = ν5*ν*ν;
    var VII = tanφ/(2*ρ*ν);
    var VIII = tanφ/(24*ρ*ν3)*(5+3*tan2φ+η2-9*tan2φ*η2);
    var IX = tanφ/(720*ρ*ν5)*(61+90*tan2φ+45*tan4φ);
    var X = secφ/ν;
    var XI = secφ/(6*ν3)*(ν/ρ+2*tan2φ);
    var XII = secφ/(120*ν5)*(5+28*tan2φ+24*tan4φ);
    var XIIA = secφ/(5040*ν7)*(61+662*tan2φ+1320*tan4φ+720*tan6φ);

    var dE = (E-E0), dE2 = dE*dE, dE3 = dE2*dE, dE4 = dE2*dE2, dE5 = dE3*dE2, dE6 = dE4*dE2, dE7 = dE5*dE2;
    φ = φ - VII*dE2 + VIII*dE4 - IX*dE6;
    var λ = λ0 + X*dE - XI*dE3 + XII*dE5 - XIIA*dE7;

    var point =  new LatLon(φ.toDegrees(), λ.toDegrees(), LatLon.datum.OSGB36);
    if (datum != LatLon.datum.OSGB36) point = point.convertDatum(datum);

    return point;
};


/**
 * Parses grid reference to OsGridRef object.
 *
 * Accepts standard grid references (eg 'SU 387 148'), with or without whitespace separators, from
 * two-digit references up to 10-digit references (1m × 1m square), or fully numeric comma-separated
 * references in metres (eg '438700,114800').
 *
 * @param   {string}    gridref - Standard format OS grid reference.
 * @returns {OsGridRef} Numeric version of grid reference in metres from false origin (SW corner of
 *   supplied grid square).
 * @throws Error on Invalid grid reference.
 *
 * @example
 *   var grid = OsGridRef.parse('TG 51409 13177'); // grid: { easting: 651409, northing: 313177 }
 */
OsGridRef.parse = function(gridref) {
    gridref = String(gridref).trim();
    var match = gridref.match(/^(\d+),\s*(\d+)$/);
    if (match) return new OsGridRef(match[1], match[2]);
    match = gridref.match(/^[A-Z]{2}\s*[0-9]+\s*[0-9]+$/i);
    if (!match) throw new Error('Invalid grid reference');
    var l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    var l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
    if (l1 > 7) l1--;
    if (l2 > 7) l2--;
    var e100km = ((l1-2)%5)*5 + (l2%5);
    var n100km = (19-Math.floor(l1/5)*5) - Math.floor(l2/5);
    var en = gridref.slice(2).trim().split(/\s+/);
    if (en.length == 1) en = [ en[0].slice(0, en[0].length/2), en[0].slice(en[0].length/2) ];
    if (e100km<0 || e100km>6 || n100km<0 || n100km>12) throw new Error('Invalid grid reference');
    if (en.length != 2) throw new Error('Invalid grid reference');
    if (en[0].length != en[1].length) throw new Error('Invalid grid reference');
    en[0] = (en[0]+'00000').slice(0, 5);
    en[1] = (en[1]+'00000').slice(0, 5);

    var e = e100km + en[0];
    var n = n100km + en[1];

    return new OsGridRef(e, n);
};


/**
 * Converts ‘this’ numeric grid reference to standard OS grid reference.
 *
 * @param   {number} [digits=10] - Precision of returned grid reference (10 digits = metres).
 * @returns {string} This grid reference in standard format.
 */
OsGridRef.prototype.toString = function(digits) {
    digits = (digits === undefined) ? 10 : Number(digits);
    if (isNaN(digits)) throw new Error('Invalid precision');

    var e = this.easting;
    var n = this.northing;
    if (isNaN(e) || isNaN(n)) throw new Error('Invalid grid reference');
    if (digits == 0) return e.pad(6)+','+n.pad(6);
    var e100k = Math.floor(e/100000), n100k = Math.floor(n/100000);

    if (e100k<0 || e100k>6 || n100k<0 || n100k>12) return '';
    var l1 = (19-n100k) - (19-n100k)%5 + Math.floor((e100k+10)/5);
    var l2 = (19-n100k)*5%25 + e100k%5;
    if (l1 > 7) l1++;
    if (l2 > 7) l2++;
    var letPair = String.fromCharCode(l1+'A'.charCodeAt(0), l2+'A'.charCodeAt(0));
    e = Math.floor((e%100000)/Math.pow(10, 5-digits/2));
    n = Math.floor((n%100000)/Math.pow(10, 5-digits/2));

    var gridRef = letPair + ' ' + e.pad(digits/2) + ' ' + n.pad(digits/2);

    return gridRef;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Polyfill String.trim for old browsers
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (String.prototype.trim === undefined) {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}

/** Extend Number object with method to pad with leading zeros to make it w chars wide
 *  (q.v. stackoverflow.com/questions/2998784 */
if (Number.prototype.pad === undefined) {
    Number.prototype.pad = function(w) {
        var n = this.toString();
        while (n.length < w) n = '0' + n;
        return n;
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = OsGridRef; // ≡ export default OsGridRef

return module.exports;
}
/********** End of module 8: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/osgridref.js **********/
/********** Start module 9: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/dms.js **********/
__modules[9] = function(module, exports) {
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy representation conversion functions                        (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong.html                                                    */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-dms.html                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
/* eslint no-irregular-whitespace: [2, { skipComments: true }] */


/**
 * Latitude/longitude points may be represented as decimal degrees, or subdivided into sexagesimal
 * minutes and seconds.
 *
 * @module dms
 */


/**
 * Functions for parsing and representing degrees / minutes / seconds.
 * @class Dms
 */
var Dms = {};


/**
 * Parses string representing degrees/minutes/seconds into numeric degrees.
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3° 37′ 09″W).
 * Seconds and minutes may be omitted.
 *
 * @param   {string|number} dmsStr - Degrees or deg/min/sec in variety of formats.
 * @returns {number} Degrees as decimal number.
 *
 * @example
 *     var lat = Dms.parseDMS('51° 28′ 40.12″ N');
 *     var lon = Dms.parseDMS('000° 00′ 05.31″ W');
 *     var p1 = new LatLon(lat, lon); // 51.4778°N, 000.0015°W
 */
Dms.parseDMS = function(dmsStr) {
    if (typeof dmsStr == 'number' && isFinite(dmsStr)) return Number(dmsStr);
    var dms = String(dmsStr).trim().replace(/^-/, '').replace(/[NSEW]$/i, '').split(/[^0-9.,]+/);
    if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol

    if (dms == '') return NaN;
    var deg;
    switch (dms.length) {
        case 3:  // interpret 3-part result as d/m/s
            deg = dms[0]/1 + dms[1]/60 + dms[2]/3600;
            break;
        case 2:  // interpret 2-part result as d/m
            deg = dms[0]/1 + dms[1]/60;
            break;
        case 1:  // just d (possibly decimal) or non-separated dddmmss
            deg = dms[0];
            break;
        default:
            return NaN;
    }
    if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve

    return Number(deg);
};


/**
 * Separator character to be used to separate degrees, minutes, seconds, and cardinal directions.
 *
 * Set to '\u202f' (narrow no-break space) for improved formatting.
 *
 * @example
 *   var p = new LatLon(51.2, 0.33);  // 51°12′00.0″N, 000°19′48.0″E
 *   Dms.separator = '\u202f';        // narrow no-break space
 *   var pʹ = new LatLon(51.2, 0.33); // 51° 12′ 00.0″ N, 000° 19′ 48.0″ E
 */
Dms.separator = '';


/**
 * Converts decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added.
 *
 * @private
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toDMS = function(deg, format, dp) {
    if (isNaN(deg)) return null;  // give up here if we can't make a number from deg
    if (format === undefined) format = 'dms';
    if (dp === undefined) {
        switch (format) {
            case 'd':    case 'deg':         dp = 4; break;
            case 'dm':   case 'deg+min':     dp = 2; break;
            case 'dms':  case 'deg+min+sec': dp = 0; break;
            default:    format = 'dms'; dp = 0;  // be forgiving on invalid format
        }
    }

    deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)

    var dms, d, m, s;
    switch (format) {
        default: // invalid format spec!
        case 'd': case 'deg':
            d = deg.toFixed(dp);    // round degrees
            if (d<100) d = '0' + d; // pad with leading zeros
            if (d<10) d = '0' + d;
            dms = d + '°';
            break;
        case 'dm': case 'deg+min':
            var min = (deg*60).toFixed(dp); // convert degrees to minutes & round
            d = Math.floor(min / 60);       // get component deg/min
            m = (min % 60).toFixed(dp);     // pad with trailing zeros
            if (d<100) d = '0' + d;         // pad with leading zeros
            if (d<10) d = '0' + d;
            if (m<10) m = '0' + m;
            dms = d + '°'+Dms.separator + m + '′';
            break;
        case 'dms': case 'deg+min+sec':
            var sec = (deg*3600).toFixed(dp); // convert degrees to seconds & round
            d = Math.floor(sec / 3600);       // get component deg/min/sec
            m = Math.floor(sec/60) % 60;
            s = (sec % 60).toFixed(dp);       // pad with trailing zeros
            if (d<100) d = '0' + d;           // pad with leading zeros
            if (d<10) d = '0' + d;
            if (m<10) m = '0' + m;
            if (s<10) s = '0' + s;
            dms = d + '°'+Dms.separator + m + '′'+Dms.separator + s + '″';
            break;
    }

    return dms;
};


/**
 * Converts numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S).
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toLat = function(deg, format, dp) {
    var lat = Dms.toDMS(deg, format, dp);
    return lat===null ? '–' : lat.slice(1)+Dms.separator + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
};


/**
 * Convert numeric degrees to deg/min/sec longitude (3-digit degrees, suffixed with E/W)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toLon = function(deg, format, dp) {
    var lon = Dms.toDMS(deg, format, dp);
    return lon===null ? '–' : lon+Dms.separator + (deg<0 ? 'W' : 'E');
};


/**
 * Converts numeric degrees to deg/min/sec as a bearing (0°..360°)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toBrng = function(deg, format, dp) {
    deg = (Number(deg)+360) % 360;  // normalise -ve values to 180°..360°
    var brng =  Dms.toDMS(deg, format, dp);
    return brng===null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360°!
};


/**
 * Returns compass point (to given precision) for supplied bearing.
 *
 * @param   {number} bearing - Bearing in degrees from north.
 * @param   {number} [precision=3] - Precision (1:cardinal / 2:intercardinal / 3:secondary-intercardinal).
 * @returns {string} Compass point for supplied bearing.
 *
 * @example
 *   var point = Dms.compassPoint(24);    // point = 'NNE'
 *   var point = Dms.compassPoint(24, 1); // point = 'N'
 */
Dms.compassPoint = function(bearing, precision) {
    if (precision === undefined) precision = 3;

    bearing = ((bearing%360)+360)%360; // normalise to 0..360

    var point;

    switch (precision) {
        case 1: // 4 compass points
            switch (Math.round(bearing*4/360)%4) {
                case 0: point = 'N'; break;
                case 1: point = 'E'; break;
                case 2: point = 'S'; break;
                case 3: point = 'W'; break;
            }
            break;
        case 2: // 8 compass points
            switch (Math.round(bearing*8/360)%8) {
                case 0: point = 'N';  break;
                case 1: point = 'NE'; break;
                case 2: point = 'E';  break;
                case 3: point = 'SE'; break;
                case 4: point = 'S';  break;
                case 5: point = 'SW'; break;
                case 6: point = 'W';  break;
                case 7: point = 'NW'; break;
            }
            break;
        case 3: // 16 compass points
            switch (Math.round(bearing*16/360)%16) {
                case  0: point = 'N';   break;
                case  1: point = 'NNE'; break;
                case  2: point = 'NE';  break;
                case  3: point = 'ENE'; break;
                case  4: point = 'E';   break;
                case  5: point = 'ESE'; break;
                case  6: point = 'SE';  break;
                case  7: point = 'SSE'; break;
                case  8: point = 'S';   break;
                case  9: point = 'SSW'; break;
                case 10: point = 'SW';  break;
                case 11: point = 'WSW'; break;
                case 12: point = 'W';   break;
                case 13: point = 'WNW'; break;
                case 14: point = 'NW';  break;
                case 15: point = 'NNW'; break;
            }
            break;
        default:
            throw new RangeError('Precision must be between 1 and 3');
    }

    return point;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Polyfill String.trim for old browsers
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (String.prototype.trim === undefined) {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Dms; // ≡ export default Dms

return module.exports;
}
/********** End of module 9: /Users/hypo2/Desktop/geodesy/node_modules/geodesy/dms.js **********/
/********** Footer **********/
if(typeof module === "object")
	module.exports = __require(0);
else
	return __require(0);
})();
/********** End of footer **********/
