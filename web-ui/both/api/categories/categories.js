import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Categories = new Mongo.Collection('Categories');


/*
{
  _id: "atm",
  translations: {
    "de": "Geldautomat",
    "en": "ATM",
  },
  synonyms: ["ATM", "amenity=atm"],
  icon: "atm",
  parentIds:["leisure", "money"],  // top-level category if empty
}
*/


// FIXME: WARNING, these need to be fixed
Categories.allow({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


Categories.schema = new SimpleSchema({
  icon: {
    type: String,
    label: 'Icon URL (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'http://images/icons/bla.png',
        rows: 2,
      },
    },
    regEx: /[a-z-.]+/,
  },
  translations: {
    type: { en: String, de: String },
  },
  synonyms: {
    type: [String],
  },
  parentIds: {
    type: [String],
  },
});

Categories.attachSchema(Categories.schema);

Categories.publicFields = {
  icon: 1,
  translations: 1,
  synonums: 1,
  parentIds: 1,
};
