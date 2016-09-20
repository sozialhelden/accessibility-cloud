import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
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

Factory.define('placeImport', PlaceImports, {
  timestamp: 234234234,
  placeInfoId: () => Factory.get('placeInfo'),
  sourceImportId: () => Factory.get('sourceImport'),
});

PlaceImports.helpers({
  editableBy: isAdmin,
});
