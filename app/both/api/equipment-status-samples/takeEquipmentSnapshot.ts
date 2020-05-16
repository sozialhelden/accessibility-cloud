import { EquipmentInfos } from '../equipment-infos/equipment-infos';

export type LightweightEquipmentInfo = {
  _id?: string;
  properties: {
    isWorking: boolean;
    originalId: string;
  }
}

/**
 * @returns an array of `EquipmentInfo` objects. Each object is stripped, only
 * `properties.isWorking` and `properties.originalId` attributes are left.
 */
export default function takeEquipmentSnapshotForSourceId(sourceId): LightweightEquipmentInfo[] {
  console.log(`Taking snapshot of all equipment from source ID ${sourceId}.`)
  const selector = { 'properties.sourceId': sourceId };
  const options = {
    transform: null,
    fields: {
      'properties.isWorking': 1,
      'properties.originalId': 1,
    },
  };
  return EquipmentInfos.find(selector, options).fetch();
}
