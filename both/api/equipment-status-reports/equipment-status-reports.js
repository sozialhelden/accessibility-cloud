import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { EquipmentInfos } from '../equipment-infos/equipment-infos';

export const EquipmentStatusReports = new Mongo.Collection('EquipmentStatusReports');

EquipmentStatusReports.schema = new SimpleSchema({
  equipmentInfoId: {
    type: String,
  },
  sourceId: {
    type: String,
  },
  equipmentToken: {
    type: String,
  },
  isoDate: {
    type: String,
  },
  isWorking: {
    type: Boolean,
    optional: true,
  },
  timeSinceLastActivityInSeconds: {
    type: Number,
    optional: true,
  },
  customData: {
    type: Object,
    optional: true,
    blackbox: true,
  },
});

EquipmentStatusReports.attachSchema(EquipmentStatusReports.schema);

EquipmentStatusReports.relationships = {
  belongsTo: {
    equipmentInfo: {
      foreignCollection: EquipmentInfos,
      foreignKey: 'equipmentInfoId',
    },
  },
};

if (Meteor.isClient) {
  window.EquipmentStatusReports = EquipmentStatusReports;
}