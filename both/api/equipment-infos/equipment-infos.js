import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Disruptions } from '../disruptions/disruptions';
import { Sources } from '../sources/sources';
import helpers from './helpers';
import i18nHelpers from '../shared/i18nHelpers';
import tileCoordinatesSchema from '../shared/tile-indexing/tileCoordinatesSchema';
import LocationSchema from '../../lib/location-schema';

export const EquipmentInfos = new Mongo.Collection('EquipmentInfos');

const LengthSchema = new SimpleSchema({
  value: {
    type: Number,
  },
  unit: {
    type: String,
    allowedValues: ['cm', 'centimeter', 'centimeters', 'm', 'meters', 'meter'],
  },
  rawValue: {
    type: Match.OneOf(String, Number),
    optional: true,
  },
});

EquipmentInfos.schema = new SimpleSchema([LocationSchema, tileCoordinatesSchema, {
  statusReportToken: {
    type: String,
    optional: true,
  },
  'properties.originalId': {
    type: String,
    optional: true,
  },
  'properties.originalPlaceInfoId': {
    type: String,
    optional: true,
  },
  'properties.originalPlaceInfoIdField': {
    type: String,
    optional: true,
  },
  'properties.disruptionSourceImportId': {
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
  'properties.placeSourceId': {
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
  'properties.category': {
    type: String,
    optional: true,
    allowedValues: ['elevator', 'escalator', 'switch', 'sitemap', 'vending-machine', 'intercom', 'power-outlet'],
  },
  'properties.subCategory': {
    type: String,
    optional: true,
  },
  'properties.description': {
    type: String,
    optional: true,
  },
  'properties.shortDescription': {
    type: String,
    optional: true,
  },
  'properties.longDescription': {
    type: String,
    optional: true,
  },
  'properties.isWorking': {
    type: Boolean,
    optional: true,
  },
  'properties.hasAccessibility': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility': {
    type: Object,
    optional: true,
  },
  'properties.accessibility.hasRaisedText': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility.hasBrailleText': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility.hasSpeech': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility.isHighContrast': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility.hasLargePrint': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility.isVoiceActivated': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility.hasHeadPhoneJack': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility.isEasyToUnderstand': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility.hasDoorsInBothDirections': {
    type: Boolean,
    optional: true,
  },
  'properties.accessibility.heightOfControls': {
    type: Number,
    optional: true,
  },
  'properties.accessibility.doorWidth': {
    type: LengthSchema,
    optional: true,
  },
  'properties.accessibility.cabinWidth': {
    type: LengthSchema,
    optional: true,
  },
  'properties.accessibility.cabinLength': {
    type: LengthSchema,
    optional: true,
  },
  'properties.lastDisruptionProperties': {
    type: Disruptions.propertiesSchema,
    optional: true,
  },
  'properties.lastUpdate': {
    type: String,
    optional: true,
  },
  'properties.customData': {
    type: Object,
    optional: true,
    blackbox: true,
  },
}]);

EquipmentInfos.attachSchema(EquipmentInfos.schema);


EquipmentInfos.relationships = {
  hasMany: {
    disruptions: {
      foreignCollection: Disruptions,
      foreignKey: 'properties.equipmentInfoId',
    },
  },
  belongsTo: {
    source: {
      foreignCollection: Sources,
      foreignKey: 'properties.sourceId',
    },
  },
};

EquipmentInfos.helpers(helpers);
EquipmentInfos.helpers(i18nHelpers);

if (Meteor.isClient) {
  window.EquipmentInfos = EquipmentInfos;
}
