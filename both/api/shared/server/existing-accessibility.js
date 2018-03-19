import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { FilterPresets } from '/both/api/filter-presets/filter-presets';

// Returns MongoDB query options for given request

export default function existingAccessibilitySelector(req, _id) {
  if (_id) return {};
  
  const fieldsQuery = _.pick(req.query, 'includePlacesWithoutAccessibility');

  const schema = new SimpleSchema({
    includePlacesWithoutAccessibility: {
      type: Number,
      optional: true,
    },
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(fieldsQuery);

  // Throw ValidationError if something is wrong
  schema.validate(fieldsQuery);

  if (fieldsQuery.includePlacesWithoutAccessibility === 1) {
    return {};
  }

  return { 'properties.accessibility': { $exists: true } };
}
