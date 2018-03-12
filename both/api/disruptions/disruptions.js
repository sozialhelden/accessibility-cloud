import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import LocationSchema from '../../lib/LocationSchema';
import helpers from './helpers';

export const Disruptions = new Mongo.Collection('Disruptions');

Disruptions.propertiesSchema = new SimpleSchema({
  originalId: {
    type: String,
    optional: true,
  },
  originalEquipmentInfoId: {
    type: String,
    optional: true,
  },
  originalEquipmentInfoIdField: {
    type: String,
    optional: true,
  },
  equipmentInfoId: {
    type: String,
    optional: true,
  },
  originalPlaceInfoId: {
    type: String,
    optional: true,
  },
  originalPlaceInfoIdField: {
    type: String,
    optional: true,
  },
  placeInfoId: {
    type: String,
    optional: true,
  },
  originalData: {
    type: String,
    optional: true,
  },
  sourceId: {
    type: String,
    optional: true,
  },
  sourceImportId: {
    type: String,
    optional: true,
  },
  category: {
    type: String,
    optional: true,
    allowedValues: ['elevator', 'escalator', 'switch', 'sitemap', 'vending-machine', 'intercom', 'power-outlet'],
  },
  isEquipmentWorking: {
    type: Boolean,
    optional: true,
  },
  stateExplanation: {
    type: String,
    optional: true,
  },
  outOfOrderReason: {
    type: String,
    optional: true,
  },
  alternativeRouteInstructions: {
    type: String,
    optional: true,
  },
  startDate: {
    type: String,
    optional: true,
  },
  plannedCompletionDate: { // can be used for planned completion dates, too
    type: String,
    optional: true,
  },
  lastUpdate: {
    type: String,
    optional: true,
  },
});

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
  properties: {
    type: Disruptions.propertiesSchema,
  },
});

Disruptions.attachSchema(Disruptions.schema);
Disruptions.helpers(helpers);

if (Meteor.isClient) {
  window.Disruptions = Disruptions;
}
