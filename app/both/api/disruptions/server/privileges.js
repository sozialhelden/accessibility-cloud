import { isAdmin } from '/both/lib/is-admin';
import { check } from 'meteor/check';
import { Disruptions } from '../disruptions';
import { Sources } from '../../sources/sources';

Disruptions.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

Disruptions.publicFields = {
  properties: 1,
  geometry: 1,
};

Disruptions.helpers({
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

Disruptions.visibleSelectorForUserId = (userId) => {
  if (!userId) {
    return null;
  }

  check(userId, String);
  return disruptionSelectorForSourceSelector(Sources.visibleSelectorForUserId(userId));
};

Disruptions.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  return disruptionSelectorForSourceSelector(Sources.visibleSelectorForAppId(appId));
};
