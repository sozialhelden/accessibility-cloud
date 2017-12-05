import { Meteor } from 'meteor/meteor';
import { Disruptions } from '../disruptions';

Meteor.startup(() => {
  Disruptions._ensureIndex({ 'properties.sourceId': 1 });
  Disruptions._ensureIndex({ 'properties.sourceImportId': 1 });
  Disruptions._ensureIndex({ 'properties.originalId': 1 });
  Disruptions._ensureIndex({ 'properties.sourceId': 1, 'properties.originalId': 1 });
  Disruptions._ensureIndex({ 'properties.placeSourceId': 1 });
  Disruptions._ensureIndex({ 'properties.equipmentSourceId': 1 });
  Disruptions._ensureIndex({ 'properties.placeInfoId': 1 });
  Disruptions._ensureIndex({ 'properties.originalPlaceInfoId': 1 });
  Disruptions._ensureIndex({ 'properties.equipmentInfoId': 1 });
  Disruptions._ensureIndex({ 'properties.category': 1 });
  Disruptions._ensureIndex({ 'properties.originalEquipmentInfoId': 1 });

  console.log('Ensuring geospatial index for Disruptions...');
  Disruptions._ensureIndex({ geometry: '2dsphere' });
});
