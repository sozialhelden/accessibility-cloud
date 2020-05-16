import { isAdmin } from '/both/lib/is-admin';
import { Categories } from '../categories.js';

Categories.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

Categories.publicFields = {
  icon: 1,
  translations: 1,
  synonyms: 1,
  parentIds: 1,
};

Categories.helpers({
  editableBy: isAdmin,
});

Categories.visibleSelectorForUserId = () => ({});
Categories.visibleSelectorForAppId = () => ({});
