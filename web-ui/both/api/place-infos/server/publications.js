import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlaceInfos } from '../place-infos.js';

const options = { fields: PlaceInfos.publicFields };

Meteor.publish('placeInfos.public', () => PlaceInfos.find({}, options));

Meteor.publish('placeInfosFromImport.public', function (sourceImportId) {
  check(sourceImportId, String);

  return PlaceInfos.find({ sourceImportId }, { limit: 1000 });
});
