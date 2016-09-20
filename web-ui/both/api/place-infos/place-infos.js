import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
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

Factory.define('placeInfo', PlaceInfos, {
  sourceId: () => Factory.get('source'),
  lastSourceImportId: () => Factory.get('sourceImport'),
  data: {
    providedId: '234234',
    name: 'Hotel Adlon',
    accessible: 0.2,
  },
});

PlaceInfos.helpers({
  editableBy: isAdmin,
});
