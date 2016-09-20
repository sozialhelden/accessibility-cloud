import { Mongo } from 'meteor/mongo';
import { isAdmin } from '/both/lib/is-admin';

export const PlaceImports = new Mongo.Collection('PlaceImports');

PlaceImports.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

PlaceImports.publicFields = {
  name: 1,
  text: 1,
};

PlaceImports.helpers({
  editableBy: isAdmin,
});
