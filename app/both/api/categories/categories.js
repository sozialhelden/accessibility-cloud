import { Mongo } from 'meteor/mongo';
import { Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Categories = new Mongo.Collection('Categories');


/*
{
  _id: "atm",
  translations: {
    _id: {
      "de_DE": "Geldautomat",
      "en_US": "ATM",
    }
  },
  synonyms: ["ATM", "amenity=atm"],
  icon: "atm",
  parentIds:["leisure", "money"],  // top-level category if empty
}
*/

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
  synonyms: {
    type: [String],
  },
  parentIds: {
    type: [String],
  },
  translations: {
    type: Match.ObjectIncluding({}),
    blackbox: true,
  },
  'translations._id': {
    type: Match.ObjectIncluding({}),
    blackbox: true,
  },
  'translations._id.$': {
    type: String,
  },
});

Categories.attachSchema(Categories.schema);

Categories.visibleSelectorForUserId = () => ({});
Categories.visibleSelectorForAppId = () => ({});
Categories.apiParameterizedSelector = ({ visibleContentSelector }) => visibleContentSelector;
