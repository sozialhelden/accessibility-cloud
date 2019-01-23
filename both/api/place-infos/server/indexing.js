import { Meteor } from 'meteor/meteor';
import { PlaceInfos } from '../place-infos';
import ensureTileCoordinatesIndexOnCollection from '../../shared/tile-indexing/ensureTileCoordinatesIndexOnCollection';

Meteor.startup(() => {
  PlaceInfos._ensureIndex({ 'properties.sourceId': 1 });
  PlaceInfos._ensureIndex({ 'properties.sourceImportId': 1 });
  PlaceInfos._ensureIndex({ 'properties.category': 1 });
  PlaceInfos._ensureIndex({ 'properties.accessibility': 1 });
  PlaceInfos._ensureIndex({ 'properties.accessibility.accessibleWith.wheelchair': 1 });
  PlaceInfos._ensureIndex({ 'properties.accessibility.partlyAccessibleWith.wheelchair': 1 });
  PlaceInfos._ensureIndex({ 'properties.originalId': 1 });
  PlaceInfos._ensureIndex({ 'properties.sourceId': 1, 'properties.originalId': 1 });
  PlaceInfos._ensureIndex({ 'properties.sourceName': 1 });
  PlaceInfos._ensureIndex({ 'properties.organizationName': 1 });

  console.log('Ensuring geospatial index for PlaceInfos...');
  PlaceInfos._ensureIndex({ geometry: '2dsphere' });
  ensureTileCoordinatesIndexOnCollection(PlaceInfos);
});
