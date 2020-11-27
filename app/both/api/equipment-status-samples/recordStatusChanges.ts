import { compact, keyBy, uniq } from 'lodash';
import recordEquipmentStatusSample from './recordEquipmentStatusSample';
import { LightweightEquipmentInfo } from './takeEquipmentSnapshot';
import { EquipmentInfos } from '../equipment-infos/equipment-infos';
import { PlaceInfos } from '../place-infos/place-infos';

/**
 * Record changes in `isWorking` attributes for all equipment that changed this property between
 * two given snapshots
 */

export default function recordStatusChanges({
  source,
  sourceImportId,
  organization,
  equipmentInfosBeforeImport,
  equipmentInfosAfterImport,
}: {
  sourceId: string,
  sourceImportId: string,
  source: any, // TODO: Type this correctly
  organization: any, // TODO: Type this correctly
  organizationId: string,
  equipmentInfosBeforeImport: LightweightEquipmentInfo[],
  equipmentInfosAfterImport: LightweightEquipmentInfo[]
}) {
  const equipmentInfosAfterImportByOriginalId = keyBy(equipmentInfosAfterImport, e => e.properties.originalId);

  console.log(`Recording new equipment status for ‘${source.name}’ (${source._id}) by ${organization.name}…`);
  console.log(`Facilities before: ${equipmentInfosBeforeImport.length}`);
  console.log(`Facilities after: ${Object.keys(equipmentInfosAfterImportByOriginalId).length}`);
  const changedLightweightEquipmentInfos = [];

  for (const before of equipmentInfosBeforeImport) {
    const after = equipmentInfosAfterImportByOriginalId[before.properties.originalId];
    if (before.properties.isWorking !== after.properties.isWorking) {
      changedLightweightEquipmentInfos.push(after);
    }
  }
  const ids = changedLightweightEquipmentInfos.map(e => e._id);
  const changedEquipmentInfos = EquipmentInfos.find({ _id: { $in: ids }}, { transform: null }).fetch();
  const affectedPlaceInfoIds = compact(uniq(changedEquipmentInfos.map(e => e.properties.placeInfoId)));
  const affectedPlaceInfos = PlaceInfos.find({ _id: { $in: affectedPlaceInfoIds } }, { transform: null, fields: { 'properties.name' : 1 } }).fetch();
  const affectedPlaceInfosById = keyBy(affectedPlaceInfos, p => p._id);

  changedEquipmentInfos.forEach(e => {
    const { placeInfoId } = e.properties;
    const placeInfo = affectedPlaceInfosById[placeInfoId];
    const placeNameOrId = placeInfo && placeInfo.properties && placeInfo.properties.name || placeInfoId;
    console.log(`Status: ${e.properties.isWorking ? '✅' : '🚧'}   ${e._id}   ${e.properties.originalId}  📍 ‘${e.properties.shortDescription || e.properties.description || e.properties.longDescription}’ @ ${placeNameOrId}.`);
    recordEquipmentStatusSample({ equipmentInfo: e, organizationId: organization._id, sourceId: source._id });
  });

  console.log(`${changedEquipmentInfos.length} equipment changes recorded.`)
}
