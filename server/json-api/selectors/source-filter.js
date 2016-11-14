import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Returns MongoDB query options for given request

export function sourceFilterSelector(req) {
  const fieldsQuery = _.pick(req.query, 'includeSourceIds', 'excludeSourceIds');

  const schema = new SimpleSchema({
    includeSourceIds: {
      type: String,
      optional: true,
    },
    excludeSourceIds: {
      type: String,
      optional: true,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(fieldsQuery);

  // Throw ValidationError if something is wrong
  schema.validate(fieldsQuery);

  if (fieldsQuery.includeSourceIds && fieldsQuery.excludeSourceIds) {
    throw new Meteor.Error(422,
      'You cannot use both `includeSourceIds` and `excludeSourceIds` parameters at the same time.'
    );
  }

  if (fieldsQuery.includeSourceIds) {
    return { 'properties.sourceId': { $in: fieldsQuery.includeSourceIds.split(',') } };
  }

  if (fieldsQuery.excludeSourceIds) {
    return { 'properties.sourceId': { $nin: fieldsQuery.excludeSourceIds.split(',') } };
  }

  return {};
}
