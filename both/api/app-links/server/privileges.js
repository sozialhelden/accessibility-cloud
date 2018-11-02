import { check } from 'meteor/check';
import {
  userHasFullAccessToReferencedOrganization,
} from '/both/api/organizations/privileges';

import { AppLinks } from '../app-links';
import { Apps } from '../../apps/apps';

AppLinks.allow({
  insert: userHasFullAccessToReferencedOrganization,
  update: userHasFullAccessToReferencedOrganization,
  remove: userHasFullAccessToReferencedOrganization,
});

AppLinks.deny({
  update(userId, doc, fieldNames) {
    return fieldNames.includes('tokenString');
  },
});

AppLinks.publicFields = {
  appId: 1,
  label: 1,
  url: 1,
  order: 1,
};

AppLinks.privateFields = {};

AppLinks.visibleSelectorForUserId = () => {};

// AppLinks can only see themselves
AppLinks.visibleSelectorForAppId = () => ({});

AppLinks.helpers({
  editableBy(userId) {
    check(userId, String);
    const app = Apps.findOne(this.appId);
    return userHasFullAccessToReferencedOrganization(userId, app);
  },
});
