import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Returns MongoDB query options for given request

export default function objectIdFilterSelector(req) {
  const fieldsQuery = _.pick(req.query, 'objectId', 'context');

  const schema = new SimpleSchema({
    context: {
      type: String,
    },
    objectId: {
      type: String,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(fieldsQuery);

  // Throw ValidationError if something is wrong
  schema.validate(fieldsQuery);

  return {
    context: fieldsQuery.context,
    objectId: fieldsQuery.objectId,
    isUploadedToS3: true,
    moderationRequired: false };
}
