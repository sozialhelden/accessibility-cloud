import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlaceInfos } from '../place-infos.js';

const options = { fields: PlaceInfos.publicFields };

// Publishing all placeInfos can be VERY slow.
// Meteor.publish('placeInfos.public', () => PlaceInfos.find({}, options));

Meteor.publish('placeInfosFromImport.public', (sourceImportId) => {
  check(sourceImportId, String);

  return PlaceInfos.find({ 'properties.sourceImportId': sourceImportId }, { limit: 3 });
});

console.log('Ensuring geospatial index for PlaceInfos...');
PlaceInfos._ensureIndex({ geometry: '2dsphere' });
