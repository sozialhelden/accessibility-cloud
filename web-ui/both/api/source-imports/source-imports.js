import { Mongo } from 'meteor/mongo';
import { isAdmin } from '/both/lib/is-admin';

export const SourceImports = new Mongo.Collection('SourceImports');

SourceImports.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

SourceImports.publicFields = {
  name: 1,
  text: 1,
};

SourceImports.helpers({
  editableBy: isAdmin,
});
