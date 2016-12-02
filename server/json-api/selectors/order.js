import { _ } from 'meteor/underscore';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

SimpleSchema.messages(
  { invalidFieldReference: '[label] should not contain non-allowed field name `[value]`.' },
);

// Returns MongoDB query options for given request

export function orderOptions(req, collection) {
  const paginationQuery = _.pick(req.query, 'order', 'descending');

  check(Object.keys(collection.publicFields), [String]);
  check(Object.values(collection.publicFields), [Match.OneOf(0, 1)]);
  const publicFieldNames = Object.keys(collection.publicFields);

  let context = null;

  const schema = new SimpleSchema({
    descending: {
      type: Boolean,
      optional: true,
    },
    order: {
      type: String,
      optional: true,
      custom() {
        if (this.isSet && !publicFieldNames.includes(this.value)) {
          // throw new ValidationError(
          //   { name: 'order', type: 'invalidFieldReference', value: this.value }
          // )
          return;
        }
      },
    },
  });

  context = schema.newContext();

  // Clean the data to remove whitespaces and have correct types
  schema.clean(paginationQuery);

  // Throw ValidationError if something is wrong
  schema.validate(paginationQuery);

  return _.extend({}, paginationQuery);
}
