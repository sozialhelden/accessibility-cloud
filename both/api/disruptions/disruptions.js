import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import helpers from './helpers';
import LocationSchema from '../../lib/location-schema';
import tileCoordinatesSchema from '../shared/tile-indexing/tileCoordinatesSchema';

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

Disruptions.schema = new SimpleSchema([LocationSchema, tileCoordinatesSchema, {
  properties: {
    type: Disruptions.propertiesSchema,
  },
}]);
Disruptions.attachSchema(Disruptions.schema);
Disruptions.helpers(helpers);

if (Meteor.isClient) {
  window.Disruptions = Disruptions;
}
