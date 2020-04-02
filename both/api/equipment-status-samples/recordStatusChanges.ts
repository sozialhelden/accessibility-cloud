import { keyBy } from 'lodash';
import recordEquipmentStatusSample from './recordEquipmentStatusSample';
import { LightweightEquipmentInfo } from './takeEquipmentSnapshot';
import { EquipmentInfos } from '../equipment-infos/equipment-infos';

/**
 * Record changes in `isWorking` attributes for all equipment that changed this property between
 * two given snapshots
 */

export default function recordStatusChanges({
  sourceId,
  organizationId,
  equipmentInfosBeforeImport,
  equipmentInfosAfterImport,
}: {
  sourceId: string,
  organizationId: string,
  equipmentInfosBeforeImport: LightweightEquipmentInfo[],
  equipmentInfosAfterImport: LightweightEquipmentInfo[]
}) {
  const equipmentInfosAfterImportByOriginalId = keyBy(equipmentInfosAfterImport, e => e.properties.originalId);

  console.log(`Comparing EquipmentInfos in source "${sourceId}".`);
  console.log(`Before: ${equipmentInfosBeforeImport.length} equipment infos`);
  console.log(`After: ${Object.keys(equipmentInfosAfterImportByOriginalId).length} equipment infos`);
  const changedLightweightEquipmentInfos = [];

  for (const before of equipmentInfosBeforeImport) {
    const after = equipmentInfosAfterImportByOriginalId[before.properties.originalId];
    if (before.properties.isWorking !== after.properties.isWorking) {
      changedLightweightEquipmentInfos.push(after);
    }
  }
  const ids = changedLightweightEquipmentInfos.map(e => e._id);
  const changedEquipmentInfos = EquipmentInfos.find({ _id: { $in: ids }}).fetch();
  changedEquipmentInfos.forEach(e => {
    console.log('Recording new equipment status:');
    console.log(e);
    // console.log(`Recording new equipment status: ${e._id} / status: ${e.properties.isWorking} / originalId: ${e.properties.originalId} / ‘${e.properties.description}’.`);
    recordEquipmentStatusSample({ equipmentInfo: e, organizationId, sourceId });
  });

  console.log(`${changedEquipmentInfos.length} equipment changes recorded.`)
}
