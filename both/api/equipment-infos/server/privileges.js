import { isAdmin } from '/both/lib/is-admin';
import { check } from 'meteor/check';
import { EquipmentInfos } from '../equipment-infos';
import { Sources } from '../../sources/sources';

EquipmentInfos.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

EquipmentInfos.publicFields = {
  properties: 1,
  geometry: 1,
};

EquipmentInfos.helpers({
  editableBy: isAdmin,
});

// returns a selector that matches all places that are belonging to sources matched by the given
// data source selector
function disruptionSelectorForSourceSelector(sourceSelector) {
  check(sourceSelector, Object);
  // console.log('Including sources', JSON.stringify(sourceSelector));
  const options = { transform: null, fields: { _id: 1 } };
  const sourceIds = Sources.find(sourceSelector, options).fetch().map(s => s._id);
  return { 'properties.sourceId': { $in: sourceIds } };
}

EquipmentInfos.visibleSelectorForUserId = (userId) => {
  if (!userId) {
    return null;
  }

  check(userId, String);
  return disruptionSelectorForSourceSelector(Sources.visibleSelectorForUserId(userId));
};

EquipmentInfos.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  return disruptionSelectorForSourceSelector(Sources.visibleSelectorForAppId(appId));
};
