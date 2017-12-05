import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Returns MongoDB query options for given request

export default function nameSelector(req) {
  const nameQuery = _.pick(req.query, 'name');

  const schema = new SimpleSchema({
    name: {
      type: String,
      optional: true,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(nameQuery);

  // Throw ValidationError if something is wrong
  schema.validate(nameQuery);

  if (nameQuery.name) {
    return { name: nameQuery.name };
  }

  return {};
}
