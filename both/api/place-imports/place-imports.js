import { Mongo } from 'meteor/mongo';
import { isAdmin } from '/both/lib/is-admin';
import { Meteor } from 'meteor/meteor';

export const PlaceImports = new Mongo.Collection('PlaceImports');

if (Meteor.isClient) {
  window.PlaceImports = PlaceImports;
}

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
