import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
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

Languages.attachSchema(Languages.schema);

Languages.publicFields = {
  name: 1,
  languageCode: 1,
};

Factory.define('language', Languages, {
  name: 'Deutsch',
  languageCode: 'de',
});

Languages.helpers({
  editableBy: isAdmin,
});
