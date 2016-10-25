import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Returns MongoDB query options for given request

export function fieldOptions(req) {
  const fieldsQuery = _.pick(req.query, 'include', 'exclude');
  console.log('Fields:', fieldsQuery);

  const schema = new SimpleSchema({
    include: {
      type: String,
      optional: true,
    },
    exclude: {
      type: String,
      optional: true,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(fieldsQuery);

  // Throw ValidationError if something is wrong
  schema.validate(fieldsQuery);

  // TODO: This is not safe yet. It has to ensure all fields are publicFields of the collection.

  const fields = {};
  Object.assign(
    fields,
    _.object((fieldsQuery.include || '').split(',').map(field => [field, 1])),
    _.object((fieldsQuery.exclude || '').split(',').map(field => [field, 0]))
  );
  delete fields[''];

  return { fields };
}
