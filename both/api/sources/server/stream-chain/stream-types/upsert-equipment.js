import { EquipmentInfos } from '/both/api/equipment-infos/equipment-infos';
import Upsert from './upsert';


export default class UpsertEquipmentInfo extends Upsert {

  constructor(options) {
    super(options);
    this.stream.unitName = 'equipment infos';
  }
}

UpsertEquipmentInfo.collection = EquipmentInfos;
