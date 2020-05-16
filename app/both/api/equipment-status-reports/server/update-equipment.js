import set from 'lodash/set';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import { EquipmentStatusReports } from '../equipment-status-reports';
import sendPurgeRequestToFastly from '../../../../server/cdn-purging/sendPurgeRequestToFastly';
import isEmpty from 'lodash/isEmpty';

const MaximalAllowedInactivityInSeconds = 60 * 60;


export default function updateEquipmentWithStatusReport(report) {
  const lastUpdate = new Date().toISOString();
  const modifier = {};

  if (typeof report.isWorking === 'boolean') {
    // `true` means the sensor sensed that the elevator had a ride. `false` can be sent in case of
    // a power outage (in this case they might be unplugged for maintenance).
    // This is saved in the DB as it is explicit knowledge.
    console.log('Got explicit isWorking flag', report.isWorking, 'from sensor.');
    set(modifier, ['$set', 'properties.lastUpdate'], lastUpdate);
    set(modifier, ['$set', 'properties.isWorking'], report.isWorking);
  } else if (typeof report.timeSinceLastActivityInSeconds === 'number' && report.timeSinceLastActivityInSeconds >= 0) {
    // The sensor has not been rebooted and still knows the last ride time...
    console.log('Sensor not rebooted since last activity.');
    if (report.timeSinceLastActivityInSeconds < MaximalAllowedInactivityInSeconds) {
      // ...which was not long ago! -> Set elevator to working.
      set(modifier, ['$set', 'properties.isWorking'], true);
    } else {
      // ...the last ride was too long ago -> unset isWorking flag.
      set(modifier, ['$unset', 'properties.isWorking'], true);
    }
  } else if (typeof report.timeSinceLastActivityInSeconds === 'number' && report.timeSinceLastActivityInSeconds < 0) {
    // Sensor was rebooted.
  }

  const id = report.equipmentInfoId;
  console.log('Updating equipment', id, modifier);
  if (!isEmpty(modifier)) {
    EquipmentInfos.update(id, modifier);
    sendPurgeRequestToFastly([id]);
  }
}

EquipmentStatusReports.afterInsertViaAPI = (doc) => {
  updateEquipmentWithStatusReport(doc);
};
