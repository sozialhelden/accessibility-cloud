import { isAdmin } from '/both/lib/is-admin';
import { check } from 'meteor/check';
import { PlaceInfos } from '../place-infos';
import { Sources } from '../../sources/sources';

PlaceInfos.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

PlaceInfos.publicFields = {
  _id: 1,
  geometry: 1,
  'properties.ids': 1,
  'properties._id': 1,
  'properties.originalId': 1,
  'properties.sourceId': 1,
  'properties.sourceImportId': 1,
  'properties.name': 1,
  'properties.category': 1,
  'properties.description': 1,
  'properties.infoPageUrl': 1,
  'properties.editPageUrl': 1,
  'properties.placeWebsiteUrl': 1,
  'properties.phoneNumber': 1,
  'properties.emailAddress': 1,
  'properties.address': 1,
  'properties.accessibility': 1,
  'properties.equipmentInfos': 1,
};

PlaceInfos.privateFields = {
  'properties.originalData': 1,
};

PlaceInfos.helpers({
  editableBy: isAdmin,
});

// returns a selector that matches all places that are belonging to sources matched by the given
// data source selector
function placeInfoSelectorForSourceSelector(sourceSelector) {
  check(sourceSelector, Object);
  // console.log('Including sources', JSON.stringify(sourceSelector));
  const options = { transform: null, fields: { _id: 1 } };
  const sourceIds = Sources.find(sourceSelector, options).fetch().map(s => s._id).sort();
  return { 'properties.sourceId': { $in: sourceIds } };
}

PlaceInfos.visibleSelectorForUserId = (userId) => {
  if (!userId) {
    return null;
  }

  check(userId, String);
  return placeInfoSelectorForSourceSelector(Sources.visibleSelectorForUserId(userId));
};

PlaceInfos.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  return placeInfoSelectorForSourceSelector(Sources.visibleSelectorForAppId(appId));
};
