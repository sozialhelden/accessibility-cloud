import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Returns MongoDB query options for given request

export default function placeIdFilterSelector(req) {
  const fieldsQuery = _.pick(req.query, 'placeId');

  const schema = new SimpleSchema({
    placeId: {
      type: String,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(fieldsQuery);

  // Throw ValidationError if something is wrong
  schema.validate(fieldsQuery);

  return { placeId: fieldsQuery.placeId };
}
