import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Organizations } from '/both/api/organizations/organizations';

export const Apps = new Mongo.Collection('Apps');

// Deny all client-side updates since we will be using methods to manage this collection
// Apps.deny({
//   insert() { return true; },
//   update() { return true; },
//   remove() { return true; },
// });


// FIXME: WARNING, these need to be fixed
Apps.allow({
  insert() { return true; }, // FIXME: should be member of organization or admin
  update() { return true; },
  remove() { return true; },
});


Apps.schema = new SimpleSchema({
  organizationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
      afFormGroup: {
        label: false,
      },
    },
  },
  name: {
    type: String,
  },
  description: {
    type: String,
    label: 'Description (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. This app helps people to...',
        rows: 10,
      },
    },
    optional: true,
  },
  website: {
    label: 'Web-site (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'http://a11y-hotels.org',
      },
    },
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  tocForAppsAccepted: {
    label: 'I read and agree the terms of conditions for apps',
    type: Boolean,
    autoform: {
      afFieldInput: {
        placeholder: 'http://a11y-hotels.org',
      },
    },
  },
});

Apps.attachSchema(Apps.schema);

Apps.publicFields = {
  organizationId: 1,
  name: 1,
  description: 1,
  website: 1,
  tocForAppsAccepted: 1,
};

Apps.visibleSelectorForUserId = () => ({});

Apps.helpers({
  // Used by methods-validation
  editableBy(userId) {
    // FIXME: allow editing only for members and admins of source
    return true;
  },
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
});
