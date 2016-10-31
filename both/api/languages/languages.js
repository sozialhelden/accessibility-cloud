import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { isAdmin } from '/both/lib/is-admin';

export const Languages = new Mongo.Collection('Languages');

Languages.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

Languages.schema = new SimpleSchema({
  name: { type: String },
  languageCode: { type: String },
});

Languages.visibleSelectorForUserId = () => ({});

Languages.attachSchema(Languages.schema);

Languages.publicFields = {
  name: 1,
  languageCode: 1,
};

Languages.helpers({
  editableBy: isAdmin,
});
