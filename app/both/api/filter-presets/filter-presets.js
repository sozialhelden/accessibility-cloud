import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const FilterPresets = new Mongo.Collection('FilterPresets');

FilterPresets.schema = new SimpleSchema({
  name: { type: String },
  selectorJSON: { type: String },
});

FilterPresets.attachSchema(FilterPresets.schema);

FilterPresets.helpers({
  toSelector() {
    return JSON.parse(this.selectorJSON);
  },
});
