import set from 'lodash/set';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import { PlaceInfos } from '../../place-infos/place-infos';
import { EquipmentStatusReports } from '../equipment-status-reports';

const MaximalAllowedInactivityInSeconds = 60 * 60;


export default function updateEquipmentWithStatusReport(report) {
  const isActive = report.timeSinceLastActivityInSeconds < MaximalAllowedInactivityInSeconds;
  console.log('inactive since', report.timeSinceLastActivityInSeconds, 'max allowed', MaximalAllowedInactivityInSeconds);
  const lastUpdate = new Date().toISOString();
  const modifier = {};
  if (isActive || report.isWorking) {
    set(modifier, ['$set', 'properties.isWorking'], true);
    set(modifier, ['$set', 'properties.lastUpdate'], lastUpdate);
  } else if (typeof report.isWorking === 'undefined') {
    set(modifier, ['$unset', 'properties.isWorking'], true);
  } else {
    set(modifier, ['$set', 'properties.isWorking'], false);
    set(modifier, ['$set', 'properties.lastUpdate'], lastUpdate);
  }
  const id = report.equipmentInfoId;

  console.log('Updating equipment', id, modifier);
  EquipmentInfos.update(id, modifier);
  const equipmentInfo = EquipmentInfos.findOne(id, { transform: null, fields: { statusReportToken: false, 'properties.originalData': false } });
  if (!equipmentInfo) return;
  if (!equipmentInfo.placeInfoId) return;
  PlaceInfos.update(equipmentInfo.placeInfoId, {
    $set: {
      [`properties.equipmentInfos.${equipmentInfo._id}`]: equipmentInfo,
    },
  });
}

EquipmentStatusReports.afterInsertViaAPI = (doc) => {
  updateEquipmentWithStatusReport(doc);
};
