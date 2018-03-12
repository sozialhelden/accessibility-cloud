import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Return a MongoDB document selector for a search by distance built
// with query parameters from given request.

export default function distanceSearchSelector(req) {
  const originalIdQuery = _.pick(req.query, 'originalId', 'sourceId');

  // If no location parameter is given, just return an empty selector
  if (!(originalIdQuery.originalId || originalIdQuery.sourceId)) {
    return {};
  }

  // Otherwise, validate everything and build the selector
  const schema = new SimpleSchema({
    originalId: {
      type: String,
    },
    sourceId: {
      type: String,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(originalIdQuery);

  // Throw ValidationError if something is wrong
  schema.validate(originalIdQuery);

  const { originalId, sourceId } = originalIdQuery;

  return {
    'properties.originalId': originalId,
    'properties.sourceId': sourceId,
  };
}
