import Cache from 'ttl';
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
  'properties.customData': 1,
  'properties.parentPlaceInfoName': 1,

  // Quick fix for source 'a7hEpRxZ9c5AxdtBx' to be removed after 1. April 2018
  'properties.clubType': 1,
  'properties.sports': 1,
  'properties.logo': 1,
  'properties.phone': 1,
  'properties.email': 1,
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

const userIdCache = new Cache({ ttl: 60 * 1000, capacity: 100000 });

PlaceInfos.visibleSelectorForUserId = (userId) => {
  if (!userId) {
    return null;
  }
  check(userId, String);
  const cachedResult = userIdCache.get(userId);
  if (cachedResult) {
    return cachedResult;
  }
  const result = placeInfoSelectorForSourceSelector(Sources.visibleSelectorForUserId(userId));
  userIdCache.put(userId, result);
  return result;
};


const appIdCache = new Cache({ ttl: 60 * 1000, capacity: 100000 });

PlaceInfos.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  const cachedResult = appIdCache.get(appId);
  if (cachedResult) {
    return cachedResult;
  }
  const result = placeInfoSelectorForSourceSelector(Sources.visibleSelectorForAppId(appId));
  appIdCache.put(appId, result);
  return result;
};
