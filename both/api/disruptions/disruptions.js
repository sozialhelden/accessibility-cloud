import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Disruptions = new Mongo.Collection('Disruptions');

Disruptions.schema = new SimpleSchema({
  'geometry.type': {
    type: String,
    allowedValues: ['Point'],
  },
  'geometry.coordinates': {
    type: Array,
  },
  'geometry.coordinates.$': {
    type: Number,
    min: -180,
    max: 180,
    decimal: true,
  },
  // 'geometry.coordinates.1': {
  //   type: Number,
  //   min: -90,
  //   max: 90,
  //   decimal: true,
  // },
  'properties.placeInfoId': {
    type: String,
    optional: true,
  },
  'properties.equipmentId': {
    type: String,
    optional: true,
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
