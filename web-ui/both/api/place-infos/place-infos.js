import { Mongo } from 'meteor/mongo';
import { isAdmin } from '/both/lib/is-admin';

export const PlaceInfos = new Mongo.Collection('PlaceInfos');

PlaceInfos.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

PlaceInfos.publicFields = {
  sourceId: 1,
  lastSourceImportId: 1,
  data: 1,
};

PlaceInfos.helpers({
  editableBy: isAdmin,
});
