import { check } from 'meteor/check';
import { Organizations } from '../organizations';
import {
  userHasFullAccessToOrganization,
} from '/both/api/organizations/privileges';

Organizations.allow({
  insert: userHasFullAccessToOrganization,
  update: userHasFullAccessToOrganization,
  remove: userHasFullAccessToOrganization,
});

Organizations.publicFields = {
  name: 1,
  shortName: 1,
  address: 1,
  addressAdditional: 1,
  zipCode: 1,
  city: 1,
  country: 1,
  phoneNumber: 1,
  webSite: 1,
  description: 1,
  tocForOrganizationsAccepted: 1,
  branding: 1,
};

Organizations.helpers({
  editableBy(userId) {
    check(userId, String);
    return userHasFullAccessToOrganization(userId, this);
  },
});

Organizations.visibleSelectorForUserId = () => ({});
Organizations.visibleSelectorForAppId = () => ({});
