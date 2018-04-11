import set from 'lodash/set';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import { PlaceInfos } from '../../place-infos/place-infos';
import { EquipmentStatusReports } from '../equipment-status-reports';
import purgeOnFastly from '../../../../server/purgeOnFastly';
import isEmpty from 'lodash/isEmpty';

const MaximalAllowedInactivityInSeconds = 60 * 60;


export default function updateEquipmentWithStatusReport(report) {
  console.log('inactive since', report.timeSinceLastActivityInSeconds, 'max allowed', MaximalAllowedInactivityInSeconds);
  const lastUpdate = new Date().toISOString();
  const modifier = {};
  if (report.isWorking) {
    set(modifier, ['$set', 'properties.isWorking'], true);
    set(modifier, ['$set', 'properties.lastUpdate'], lastUpdate);
  } else if (typeof report.timeSinceLastActivityInSeconds === 'number' && report.timeSinceLastActivityInSeconds < MaximalAllowedInactivityInSeconds) {
    set(modifier, ['$set', 'properties.isWorking'], true);
  } else if (typeof report.isWorking === 'undefined') {
    set(modifier, ['$unset', 'properties.isWorking'], true);
  } else {
    set(modifier, ['$set', 'properties.isWorking'], false);
    set(modifier, ['$set', 'properties.lastUpdate'], lastUpdate);
  }
  const id = report.equipmentInfoId;
  console.log('Updating equipment', id, modifier);
  if (!isEmpty(modifier)) {
    EquipmentInfos.update(id, modifier);
  }
  const equipmentInfo = EquipmentInfos.findOne(id, { transform: null, fields: { statusReportToken: false, 'properties.originalData': false } });
  if (!equipmentInfo) return;
  if (!equipmentInfo.properties) return;
  if (!equipmentInfo.properties.placeInfoId) return;
  const placeInfoId = equipmentInfo.properties.placeInfoId;
  PlaceInfos.update(placeInfoId, {
    $set: {
      [`properties.equipmentInfos.${equipmentInfo._id}`]: equipmentInfo,
    },
  });
  // purgeOnFastly([placeInfoId, equipmentInfo._id]);
}

EquipmentStatusReports.afterInsertViaAPI = (doc) => {
  updateEquipmentWithStatusReport(doc);
};
