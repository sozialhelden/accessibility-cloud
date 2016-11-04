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

PlaceInfos.visibleSelectorForUserId = (userId) => {
  const selector = Sources.visibleSelectorForUserId(userId);
  check(selector, Object);
  const options = { transform: null, fields: { _id: 1 } };
  const sourceIds = Sources.find(selector, options).fetch().map(s => s._id);
  return { sourceId: { $in: sourceIds } };
};
