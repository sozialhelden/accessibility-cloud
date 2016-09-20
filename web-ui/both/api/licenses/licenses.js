import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
import { isAdmin } from '/both/lib/is-admin';

export const Licenses = new Mongo.Collection('Licenses');

Licenses.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

Licenses.schema = new SimpleSchema({
  name: { type: String },
  text: { type: String },
});

Licenses.attachSchema(Licenses.schema);

Licenses.publicFields = {
  name: 1,
  text: 1,
};

Factory.define('license', Licenses, {
  name: 'Public Domain',
  text: 'You can freely use this dataset as you like.',
});

Licenses.helpers({
  editableBy: isAdmin,
});
