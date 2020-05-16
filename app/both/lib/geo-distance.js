import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// From http://gis.stackexchange.com/a/20241
function earthRadiusForLatitude(latitudeInDegrees, heightAboveSeaLevel = 0) {
  check(latitudeInDegrees, Number);
  if (isNaN(latitudeInDegrees) || latitudeInDegrees > 90 || latitudeInDegrees < -90) {
    throw new Error('Incorrect latitude given.');
  }
  // x = latitude in radians
  const x = toRadians(latitudeInDegrees);
  const r1 = 6378137; // radius at the equator
  const r2 = 6356752; // radius at the poles
  const z = Math.sqrt(
    (Math.pow(r1 * r1 * Math.cos(x), 2) + Math.pow(r2 * r2 * Math.sin(x), 2))
    /
    (Math.pow(r1 * Math.cos(x), 2) + Math.pow(r2 * Math.sin(x), 2))
  );
  return z + heightAboveSeaLevel;
}

// Haversine formula, from http://www.movable-type.co.uk/scripts/latlong.html
export function geoDistance([lon1, lat1], [lon2, lat2]) {
  const coordinates = [lon1, lat1, lon2, lat2];
  check(coordinates, [Number]);
  if (_.any(coordinates, coordinate => isNaN(coordinate))) {
    throw new Error('A given coordinate was NaN.');
  }
  if (
    _.any([lat1, lat2], latitude => latitude > 90 || latitude < -90) ||
    _.any([lon1, lon2], longitude => longitude > 180 || longitude < -180)
  ) {
    throw new Error('Coordinates out of range.');
  }

  const radius = earthRadiusForLatitude(lat1 + 0.5 * (lat2 - lat1));
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}
