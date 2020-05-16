import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import getTilesEnclosingCircle from '../tile-indexing/getTilesEnclosingCircle';
import { surrogateKeyForTile } from '../tile-indexing/tileSurrogateKeysForFeature';

// Return a MongoDB document selector for a search by distance built
// with query parameters from given request.

export default function distanceSearchSelector({ req, surrogateKeys }) {
  const locationQuery = _.pick(req.query, 'latitude', 'longitude', 'accuracy');

  // If no location parameter is given, just return an empty selector
  if (!(locationQuery.latitude || locationQuery.longitude || locationQuery.accuracy)) {
    return {};
  }

  // Otherwise, validate everything and build the selector
  const schema = new SimpleSchema({
    latitude: {
      type: Number,
      min: -90,
      max: 90,
      decimal: true,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
      decimal: true,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1000000, // 1000 km
      decimal: true,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(locationQuery);

  // Throw ValidationError if something is wrong
  schema.validate(locationQuery);

  getTilesEnclosingCircle({
    lat: locationQuery.latitude,
    lon: locationQuery.longitude,
    radius: locationQuery.accuracy,
  })
    .forEach(tile => surrogateKeys.push(surrogateKeyForTile(tile)));

  return {
    geometry: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [locationQuery.longitude, locationQuery.latitude],
        },
        $maxDistance: locationQuery.accuracy,
      },
    },
  };
}
