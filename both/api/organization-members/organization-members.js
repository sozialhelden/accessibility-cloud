import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Organizations } from '/both/api/organizations/organizations';
import { roles } from './roles';

export const OrganizationMembers = new Mongo.Collection('OrganizationMembers');


// FIXME: WARNING, these need to be fixed
OrganizationMembers.allow({
  insert() { return true; }, // FIXME: should be member of organization or admin
  update() { return true; },
  remove() { return true; },
});


OrganizationMembers.schema = new SimpleSchema({
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
  userId: {
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
  role: {
    type: String,
    autoform: {
      afFieldInput: {
        // placeholder: 'e.g. Adam-Riese-St. 27',
        options: roles,
      },
    },
  },
});

OrganizationMembers.attachSchema(OrganizationMembers.schema);

OrganizationMembers.publicFields = {
  organizationId: 1,
  userId: 1,
  role: 1,
};

OrganizationMembers.helpers({
  // Used by methods-validation
  editableBy(userId) {
    // FIXME: allow editing only for members and admins of source
    return true;
  },
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
  getUser() {
    return Users.findOne(this.userId);
  },
});
