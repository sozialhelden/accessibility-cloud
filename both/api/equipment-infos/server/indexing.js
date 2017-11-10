import { Meteor } from 'meteor/meteor';
import { EquipmentInfos } from '../equipment-infos';

Meteor.startup(() => {
  EquipmentInfos._ensureIndex({ 'properties.sourceId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.sourceImportId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.originalId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.sourceId': 1, 'properties.originalId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.placeSourceId': 1 });
  EquipmentInfos._ensureIndex({ 'properties.placeInfoId': 1 });

  console.log('Ensuring geospatial index for EquipmentInfos...');
  EquipmentInfos._ensureIndex({ geometry: '2dsphere' });
});
