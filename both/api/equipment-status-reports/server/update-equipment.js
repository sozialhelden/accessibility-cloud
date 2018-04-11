import set from 'lodash/set';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import { PlaceInfos } from '../../place-infos/place-infos';
import { EquipmentStatusReports } from '../equipment-status-reports';
import purgeOnFastly from '../../../../server/purgeOnFastly';
import isEmpty from 'lodash/isEmpty';

const MaximalAllowedInactivityInSeconds = 60 * 60;


export default function updateEquipmentWithStatusReport(report) {
  const lastUpdate = new Date().toISOString();
  const modifier = {};

  if (typeof report.isWorking === 'boolean') {
    // `true` means the sensor sensed that the elevator had a ride. `false` can be sent in case of
    // a power outage (in this case they might be unplugged for maintenance).
    // This is saved in the DB as it is explicit knowledge.

    set(modifier, ['$set', 'properties.lastUpdate'], lastUpdate);
    set(modifier, ['$set', 'properties.isWorking'], report.isWorking);
  } else if (typeof report.timeSinceLastActivityInSeconds === 'number' && report.timeSinceLastActivityInSeconds >= 0) {
    // The sensor has not been rebooted and still knows the last ride time...
    if (report.timeSinceLastActivityInSeconds < MaximalAllowedInactivityInSeconds) {
      // ...which was not long ago! -> Set elevator to working.
      set(modifier, ['$set', 'properties.isWorking'], true);
    } else if (typeof report.isWorking === 'undefined') {
      // ...the last ride was too long ago and the sensor does not know if the elevator works.
      // -> Unset isWorking flag.
      set(modifier, ['$unset', 'properties.isWorking'], true);
    }
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
  const cacheUpdateModifier = {
    $set: {
      [`properties.equipmentInfos.${equipmentInfo._id}`]: equipmentInfo,
    },
  };
  if (typeof equipmentInfo.properties.isWorking === 'undefined') {
    cacheUpdateModifier.$unset = {
      [`properties.equipmentInfos.${equipmentInfo._id}.properties.isWorking`]: true,
    };
  }
  PlaceInfos.update(placeInfoId, cacheUpdateModifier);
  purgeOnFastly([placeInfoId, equipmentInfo._id]);
}

EquipmentStatusReports.afterInsertViaAPI = (doc) => {
  updateEquipmentWithStatusReport(doc);
};
