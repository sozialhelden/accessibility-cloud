import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

// Add a helper function to the collection's document, e.g. getLocalizedName if the attribute
// is called 'name'
export function extendCollectionSchema(collection, attributeName) {
  check(collection, Mongo.Collection);

  // eslint-disable-next-line no-param-reassign
  Object.assign(collection.schema, {
    translations: {
      type: Match.ObjectIncluding({}),
      blackbox: true,
    },
    [`translations.${attributeName}`]: {
      type: Match.ObjectIncluding({}),
      blackbox: true,
    },
    [`translations.${attributeName}.$`]: {
      type: String,
    },
  });
}
