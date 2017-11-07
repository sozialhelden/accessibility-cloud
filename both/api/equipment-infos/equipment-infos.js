import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import LocationSchema from '../../lib/LocationSchema';


export const EquipmentInfos = new Mongo.Collection('EquipmentInfos');


SimpleSchema.debug = true;

EquipmentInfos.schema = new SimpleSchema({
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
  'properties.originalId': {
    type: String,
    optional: true,
  },
  'properties.originalPlaceInfoId': {
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
  'properties.isRaised': {
    type: Boolean,
    optional: true,
  },
  'properties.isBraille': {
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
});

EquipmentInfos.attachSchema(EquipmentInfos.schema);

if (Meteor.isClient) {
  window.EquipmentInfos = EquipmentInfos;
}
