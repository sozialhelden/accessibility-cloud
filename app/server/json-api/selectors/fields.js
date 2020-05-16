import { _ } from 'meteor/underscore';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

function splitString() {
  if (this.isSet && this.value instanceof String) {
    return this.value.split(',');
  }
  return undefined;
}

// Returns MongoDB query options for given request

export function fieldOptions(req, collection) {
  const fieldsQuery = _.pick(req.query, 'include', 'exclude');

  check(Object.keys(collection.publicFields), [String]);
  check(Object.values(collection.publicFields), [Match.OneOf(0, 1)]);
  const publicFieldNames = Object.keys(collection.publicFields);

  const schema = new SimpleSchema({
    include: {
      type: Match.OneOf(Array, String),
      optional: true,
      minCount: 1,
      autoValue: splitString,
    },
    exclude: {
      type: Match.OneOf(Array, String),
      optional: true,
      minCount: 1,
      autoValue: splitString,
    },
    'include.$': {
      type: String,
      allowedValues: publicFieldNames,
    },
    'exclude.$': {
      type: String,
      allowedValues: publicFieldNames,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(fieldsQuery);

  // Throw ValidationError if something is wrong
  schema.validate(fieldsQuery);

  let fields = {};
  Object.assign(
    fields,
    _.object((fieldsQuery.include || '').split(',').map(field => [field, 1])),
    _.object((fieldsQuery.exclude || '').split(',').map(field => [field, 0])),
  );
  delete fields[''];

  if (Object.keys(fields).length === 0) {
    fields = _.object(publicFieldNames.map(f => [f, 1]));
  }

  return { fields };
}
