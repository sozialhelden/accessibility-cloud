import { EquipmentStatusSamples } from './equipment-status-samples';
import { EquipmentInfo } from '@sozialhelden/a11yjson';

export default function recordEquipmentStatusSample({
  equipmentInfo,
  organizationId,
  sourceId,
}: {
  equipmentInfo: EquipmentInfo,
  organizationId: string,
  sourceId: string,
}) {
  EquipmentStatusSamples.insert({
    organizationId,
    sourceId,
    createdAt: new Date(),
    equipmentInfoId: equipmentInfo._id,
    equipmentInfoOriginalId: equipmentInfo.properties.originalId,
    isProcessed: false,
    isWorking: equipmentInfo.properties.isWorking,
  });
}
