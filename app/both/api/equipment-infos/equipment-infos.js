import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Disruptions } from '../disruptions/disruptions';
import { Sources } from '../sources/sources';
import { Organizations } from '../organizations/organizations';
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
  'properties.placeInfoName': {
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
  'properties.sourceName': {
    type: String,
    optional: true,
  },
  'properties.organizationName': {
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
    type: Object,
    optional: true,
  },
  'properties.description.de': {
    type: String,
    optional: true,
  },
  'properties.description.en_US': {
    type: String,
    optional: true,
  },
  'properties.shortDescription': {
    type: Object,
    optional: true,
  },
  'properties.shortDescription.de': {
    type: String,
    optional: true,
  },
  'properties.shortDescription.en_US': {
    type: String,
    optional: true,
  },
  'properties.longDescription': {
    type: Object,
    optional: true,
  },
  'properties.longDescription.de': {
    type: String,
    optional: true,
  },
  'properties.longDescription.en_US': {
    type: String,
    optional: true,
  },
  'properties.manufacturerName': {
    type: String,
    optional: true,
  },
  'properties.manufacturerId': {
    type: String,
    optional: true,
  },
  'properties.manufacturerSerialNumber': {
    type: String,
    optional: true,
  },
  'properties.isWorking': {
    type: Boolean,
    optional: true,
  },
  'properties.hasRaisedText': {
    type: Boolean,
    optional: true,
  },
  'properties.hasBrailleText': {
    type: Boolean,
    optional: true,
  },
  'properties.hasSpeech': {
    type: Boolean,
    optional: true,
  },
  'properties.isHighContrast': {
    type: Boolean,
    optional: true,
  },
  'properties.hasLargePrint': {
    type: Boolean,
    optional: true,
  },
  'properties.isVoiceActivated': {
    type: Boolean,
    optional: true,
  },
  'properties.hasHeadPhoneJack': {
    type: Boolean,
    optional: true,
  },
  'properties.isEasyToUnderstand': {
    type: Boolean,
    optional: true,
  },
  'properties.hasDoorsInBothDirections': {
    type: Boolean,
    optional: true,
  },
  'properties.isIndoors': {
    type: Boolean,
    optional: true,
  },
  'properties.heightOfControls': {
    type: Number,
    optional: true,
  },
  'properties.doorWidth': {
    type: LengthSchema,
    optional: true,
  },
  'properties.cabinWidth': {
    type: LengthSchema,
    optional: true,
  },
  'properties.cabinLength': {
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
  'properties.allowPublicStatusSubscriptions': {
    type: Boolean,
    optional: true,
  },
  'properties.ownerId': {
    type: String,
    optional: true,
  },
  'properties.transitNetworkId': {
    type: String,
    optional: true,
  },
  'properties.facilityManagementId': {
    type: String,
    optional: true,
  },
  'properties.statusHardwareSensorId': {
    type: String,
    optional: true,
  },
  'properties.sourceOrganizationId': {
    type: String,
    optional: true,
  },
  'properties.debug': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  tileCoordinates: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  'tileCoordinates.$': {
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
    transitNetworkOrganization: {
      foreignCollection: Organizations,
      foreignKey: 'properties.transitNetworkId',
    },
    facilityManagementOrganization: {
      foreignCollection: Organizations,
      foreignKey: 'properties.facilityManagementId',
    },
    ownerOrganization: {
      foreignCollection: Organizations,
      foreignKey: 'properties.ownerId',
    },
  },
};

EquipmentInfos.helpers(helpers);
EquipmentInfos.helpers(i18nHelpers);

if (Meteor.isClient) {
  window.EquipmentInfos = EquipmentInfos;
}
