import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


export const EquipmentInfos = new Mongo.Collection('EquipmentInfos');


EquipmentInfos.schema = new SimpleSchema({
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
