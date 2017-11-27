import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Add a helper function to the collection's document, e.g. getLocalizedName if the attribute
// is called 'name'
export function extendCollectionSchema(collection, attributeName) {
  check(collection, Mongo.Collection);
  check(attributeName, String);

  // eslint-disable-next-line no-param-reassign
  collection.attachSchema(new SimpleSchema({
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
  }));
}
