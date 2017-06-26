import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { FilterPresets } from '/both/api/filter-presets/filter-presets';

// Returns MongoDB query options for given request

export function filterPresetSelector(req) {
  const fieldsQuery = _.pick(req.query, 'filter');

  const schema = new SimpleSchema({
    filter: {
      type: String,
      optional: true,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(fieldsQuery);

  // Throw ValidationError if something is wrong
  schema.validate(fieldsQuery);

  if (fieldsQuery.filter) {
    const filter = FilterPresets.findOne(fieldsQuery.filter);
    if (!filter) {
      throw new Meteor.Error(404, 'No filter found for given ID.');
    }

    return filter.toSelector();
  }

  return {};
}
