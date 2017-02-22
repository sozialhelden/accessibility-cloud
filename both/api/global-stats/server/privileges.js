import { isAdmin } from '/both/lib/is-admin';
import { GlobalStats } from '../global-stats';

GlobalStats.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

GlobalStats.publicFields = {
  name: 1,
  value: 1,
  date: 1,
};

GlobalStats.helpers({
  editableBy: isAdmin,
});

GlobalStats.visibleSelectorForUserId = () => ({});
GlobalStats.visibleSelectorForAppId = () => ({});
