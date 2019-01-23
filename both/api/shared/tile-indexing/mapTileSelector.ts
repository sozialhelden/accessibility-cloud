import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { tile2GeoJSONPolygon } from './tile2GeoJSONPolygon';
import { includes } from 'lodash';

// Return a MongoDB document selector for a search by distance built
// with query parameters from given request.
export default function mapTileSelector(req: { query: Object }) {
  const locationQuery = _.pick(req.query, 'x', 'y', 'z', 'ignoreTileCoordinateIndex');
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
    ignoreTileCoordinateIndex: {
      type: String,
      optional: true,
      allowedValues: ['true', 'false', '0', '1'],
    },
  });
  // Clean the data to remove whitespaces and have correct types
  schema.clean(locationQuery, { mutate: true });
  // Throw ValidationError if something is wrong
  schema.validate(locationQuery);

  if (includes(['true', '1'], locationQuery.ignoreTileCoordinateIndex)) {
    return {
      geometry: {
        $geoWithin: { $geometry: tile2GeoJSONPolygon(locationQuery) },
      },
    };
  }

  return {
    [`tileCoordinates.${locationQuery.z}.x`]: locationQuery.x,
    [`tileCoordinates.${locationQuery.z}.y`]: locationQuery.y,
  };
}
