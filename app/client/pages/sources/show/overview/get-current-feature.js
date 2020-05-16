import { singularize } from 'inflected';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { PlaceInfos } from '../../../../../both/api/place-infos/place-infos';
import { EquipmentInfos } from '../../../../../both/api/equipment-infos/equipment-infos';
import { Disruptions } from '../../../../../both/api/disruptions/disruptions';

export function getCurrentFeature() {
  FlowRouter.watchPathChange();

  const options = FlowRouter.current().route.options;
  const collectionName = options.collectionName;
  const collectionNameSingular = singularize(collectionName);
  const collection = {
    placeInfos: PlaceInfos,
    equipmentInfos: EquipmentInfos,
    disruptions: Disruptions,
  }[collectionName];

  const featureId = FlowRouter.getParam(`${collectionNameSingular}Id`);
  if (!featureId) {
    return null;
  }
  const feature = collection.findOne({ _id: featureId });
  return { collectionName, feature };
}
