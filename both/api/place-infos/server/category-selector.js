import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Returns MongoDB query options for given request

export function categoryFilterSelector(req) {
  const categoriesQuery = _.pick(req.query, 'includeCategories', 'excludeCategories');

  const schema = new SimpleSchema({
    includeCategories: {
      type: String,
      optional: true,
    },
    excludeCategories: {
      type: String,
      optional: true,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(categoriesQuery);

  // Throw ValidationError if something is wrong
  schema.validate(categoriesQuery);

  if (categoriesQuery.includeCategories && categoriesQuery.excludeCategories) {
    throw new Meteor.Error(422,
      'You cannot use both `includeCategories` and `excludeCategories` parameters at the same time.'
    );
  }

  if (categoriesQuery.includeCategories) {
    return { 'properties.category': { $in: categoriesQuery.includeCategories.split(',') } };
  }

  if (categoriesQuery.excludeCategories) {
    return { 'properties.category': { $nin: categoriesQuery.excludeCategories.split(',') } };
  }

  return {};
}
