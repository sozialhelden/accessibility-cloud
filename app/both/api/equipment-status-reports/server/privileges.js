import { isAdmin } from '/both/lib/is-admin';
import { check } from 'meteor/check';
import { EquipmentStatusReports } from '../equipment-status-reports';
import { Sources } from '../../sources/sources';

EquipmentStatusReports.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

EquipmentStatusReports.publicFields = {};

EquipmentStatusReports.privateFields = {
  isWorking: 1,
  equipmentInfoId: 1,
  sourceId: 1,
  originalData: 1,
  isoDate: 1,
  customData: 1,
};

function allowedSourceIds(sourceSelector) {
  check(sourceSelector, Object);
  const options = { transform: null, fields: { _id: 1 } };
  return Sources.find(sourceSelector, options).fetch().map(s => s._id).sort();
}


function statusReportSelectorForSourceSelector(sourceSelector) {
  return { sourceId: { $in: allowedSourceIds(sourceSelector) } };
}

EquipmentStatusReports.visibleSelectorForUserId = (userId) => {
  if (!userId) return null;
  check(userId, String);
  return statusReportSelectorForSourceSelector(Sources.visibleSelectorForUserId(userId));
};

EquipmentStatusReports.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  return statusReportSelectorForSourceSelector(Sources.visibleSelectorForAppId(appId));
};
