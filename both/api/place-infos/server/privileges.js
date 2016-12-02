import { isAdmin } from '/both/lib/is-admin';
import { check } from 'meteor/check';
import { PlaceInfos } from '../place-infos';
import { Sources } from '/both/api/sources/sources';

PlaceInfos.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

PlaceInfos.publicFields = {
  sourceId: 1,
  originalId: 1,
  lastSourceImportId: 1,
  data: 1,
};

PlaceInfos.helpers({
  editableBy: isAdmin,
});

// returns a selector that matches all places that are belonging to sources matched by the given
// data source selector
function placeInfoSelectorForSourceSelector(sourceSelector) {
  check(sourceSelector, Object);
  console.log('Including sources', JSON.stringify(sourceSelector));
  const options = { transform: null, fields: { _id: 1 } };
  const sourceIds = Sources.find(sourceSelector, options).fetch().map(s => s._id);
  return { 'properties.sourceId': { $in: sourceIds } };
}

PlaceInfos.visibleSelectorForUserId = (userId) => {
  check(userId, String);
  return placeInfoSelectorForSourceSelector(Sources.visibleSelectorForUserId(userId));
};

PlaceInfos.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  return placeInfoSelectorForSourceSelector(Sources.visibleSelectorForAppId(appId));
};
