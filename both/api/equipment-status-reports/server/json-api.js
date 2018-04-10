import { Meteor } from 'meteor/meteor';
import { EquipmentStatusReports } from '../equipment-status-reports';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';

EquipmentStatusReports.includePathsByDefault = [];

EquipmentStatusReports.isInsertableBy = ({ /* userId, appId, */ doc }) => {
  if (!doc) throw new Meteor.Error(422, 'Must supply a JSON body.');

  // Ignore userId and appId, allow access only via secret token saved in equipment info document
  if (!doc.equipmentToken) {
    throw new Meteor.Error(422, 'Body must contain an `equipmentToken` field.');
  }

  if (typeof doc.equipmentToken !== 'string') {
    throw new Meteor.Error(422, '`equipmentToken` field must be a string.');
  }

  const selector = {
    'statusReportToken': doc.equipmentToken,
    _id: doc.equipmentInfoId,
  };
  const options = { transform: null, fields: { _id: true } };

  return Boolean(EquipmentInfos.findOne(selector, options));
};
