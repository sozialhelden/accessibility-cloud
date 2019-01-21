import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { tile2GeoJSONPolygon } from './tile2GeoJSONPolygon';

// Return a MongoDB document selector for a search by distance built
// with query parameters from given request.
export default function mapTileSelector(req: { query: Object }) {
  const locationQuery = _.pick(req.query, 'x', 'y', 'z', 'useTileCoordinateIndex');
  // If no location parameter is given, just return an empty selector
  if (!(locationQuery.x || locationQuery.y || locationQuery.z)) {
    return {};
  }
  // Otherwise, validate everything and build the selector
  const schema = new SimpleSchema({
    y: {
      type: Number,
      min: 0,
      max: 1e10,
      decimal: false,
    },
    x: {
      type: Number,
      min: 0,
      max: 1e10,
      decimal: false,
    },
    z: {
      type: Number,
      min: 5,
      max: 21,
      decimal: false,
    },
    useTileCoordinateIndex: {
      type: Boolean,
      optional: true,
    },
  });
  // Clean the data to remove whitespaces and have correct types
  schema.clean(locationQuery, { mutate: true });
  // Throw ValidationError if something is wrong
  schema.validate(locationQuery);

  if (locationQuery.useTileCoordinateIndex) {
    return {
      [`tileCoordinates.${locationQuery.z}.x`]: locationQuery.x,
      [`tileCoordinates.${locationQuery.z}.y`]: locationQuery.y,
    };
  }

  return {
    geometry: {
      $geoWithin: { $geometry: tile2GeoJSONPolygon(locationQuery) },
    },
  };
}
