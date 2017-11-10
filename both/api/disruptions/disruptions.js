import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import LocationSchema from '../../lib/LocationSchema';

export const Disruptions = new Mongo.Collection('Disruptions');


Disruptions.schema = new SimpleSchema({
  geometry: {
    type: {},
    optional: true,
  },
  'geometry.type': {
    type: String,
    allowedValues: ['Point'],
  },
  'geometry.coordinates': {
    type: Array,
    minCount: 2,
    maxCount: 2
  },
  'geometry.coordinates.$': {
    type: Number,
    min: -180,
    max: 180,
    decimal: true,
  },
  'coordinates.$': {
    type: Number,
    decimal: true,
    custom() {
      if (Math.abs(this.value[0]) > 90) return 'outOfRange';
      if (Math.abs(this.value[1]) > 180) return 'outOfRange';
      return undefined;
    },
  },
  'properties.originalId': {
    type: String,
    optional: true,
  },
  'properties.originalEquipmentInfoId': {
    type: String,
    optional: true,
  },
  'properties.originalData': {
    type: String,
    optional: true,
  },
  'properties.placeInfoId': {
    type: String,
    optional: true,
  },
  'properties.sourceId': {
    type: String,
    optional: true,
  },
  'properties.sourceImportId': {
    type: String,
    optional: true,
  },
  'properties.equipmentId': {
    type: String,
    optional: true,
  },
  'properties.category': {
    type: String,
    optional: true,
    allowedValues: ['elevator', 'escalator', 'switch', 'sitemap', 'vending-machine', 'intercom', 'power-outlet'],
  },
  'properties.isWorking': {
    type: Boolean,
    optional: true,
  },
  'properties.isInMaintenance': {
    type: Boolean,
    optional: true,
  },
  'properties.outOfServiceReason': {
    type: String,
    optional: true,
  },
  'properties.furtherDescription': {
    type: String,
    optional: true,
  },
  'properties.plannedCompletion': {
    type: Date,
    optional: true,
  },
  'properties.outOfServiceOn': {
    type: Date,
    optional: true,
  },
  'properties.outOfServiceTo': {
    type: Date,
    optional: true,
  },
  'properties.lastUpdate': {
    type: Date,
    optional: true,
  },
});

Disruptions.attachSchema(Disruptions.schema);

if (Meteor.isClient) {
  window.Disruptions = Disruptions;
}
