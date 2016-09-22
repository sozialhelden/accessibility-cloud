import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Organizations } from '/both/api/organizations/organizations';

export const Sources = new Mongo.Collection('Sources');

// Deny all client-side updates since we will be using methods to manage this collection
// Sources.deny({
//   insert() { return true; },
//   update() { return true; },
//   remove() { return true; },
// });


// FIXME: WARNING, these need to be fixed
Sources.allow({
  insert() { return true; }, // FIXME: should be member of organization or admin
  update() { return true; },
  remove() { return true; },
});


Sources.schema = new SimpleSchema({
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
  licenseId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  languageId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: { 
    type: String 
  },
  primaryRegion: { 
    type: String 
  },
  description: {
    type: String,
    autoform: {
      afFieldInput: {
        placeholder: "e.g. This source shares information about...",
        rows: 10,
      },
    },
  },
  originWebsite: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
  },
  isDraft: {
    type: Boolean,
    label: 'Only a draft (not listed in publicly)',
    defaultValue: true,
  },
});

Sources.attachSchema(Sources.schema);

Sources.publicFields = {
  organizationId: 1,
  licenseId: 1,
  name: 1,
  primaryRegion: 1,
  description: 1,
  originWebsite: 1,
  isDraft:1,
};

Sources.helpers({
  // Used by methods-validation
  editableBy(userId) {
    // FIXME: allow editing only for members and admins of source
    return true;
  },
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
});
