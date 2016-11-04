import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Organizations } from '/both/api/organizations/organizations';
import { roles } from './roles';

export const OrganizationMembers = new Mongo.Collection('OrganizationMembers');


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

OrganizationMembers.helpers({
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
  getUser() {
    return Meteor.users.findOne(this.userId);
  },
});
