import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { EquipmentInfos } from '../equipment-infos/equipment-infos';
import { Sources } from '../sources/sources';
import { Organizations } from '../organizations/organizations';

export const EquipmentStatusSamples = new Mongo.Collection('EquipmentStatusSamples');

EquipmentStatusSamples.schema = new SimpleSchema({
  createdAt: {
    type: Date,
  },
  equipmentInfoId: {
    type: String,
  },
  equipmentInfoOriginalId: {
    type: String,
  },
  isProcessedForNotifications: {
    type: Boolean,
  },
  isProcessedForMonitoring: {
    type: Boolean,
  },
  isWorking: {
    type: Boolean,
  },
  organizationId: {
    type: String,
  },
  sourceId: {
    type: String,
  },
});

EquipmentStatusSamples.attachSchema(EquipmentStatusSamples.schema);

EquipmentStatusSamples.relationships = {
  belongsTo: {
    equipmentInfo: {
      foreignCollection: EquipmentInfos,
      foreignKey: 'equipmentInfoId',
    },
    source: {
      foreignCollection: Sources,
      foreignKey: 'sourceId',
    },
    organization: {
      foreignCollection: Organizations,
      foreignKey: 'organizationId',
    },
  },
};

if (Meteor.isClient) {
  window.EquipmentStatusSamples = EquipmentStatusSamples;
}
