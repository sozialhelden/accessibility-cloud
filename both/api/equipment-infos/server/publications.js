import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { EquipmentInfos } from '../equipment-infos';

const options = { fields: EquipmentInfos.publicFields };


Meteor.publish('equipmentInfos.single', function publish(equipmentInfoId) {
  check(equipmentInfoId, String);
  const selector = {
    $and: [
      { _id: equipmentInfoId },
      EquipmentInfos.visibleSelectorForUserId(this.userId),
    ],
  };
  return EquipmentInfos.find(selector, options);
});
