import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Organizations } from '/both/api/organizations/organizations';
import { roles } from './roles';

import { getDisplayedNameForUser } from '/both/lib/user-name';
import { getIconHTMLForUser, getGravatarImageUrl } from '/both/lib/user-icon';

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
    optional: true,
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
      afFormGroup: {
        label: false,
      },
    },
    custom() {
      if (this.field('invitationEmailAddress')) {
        return null;
      }

      if (!this.operator) { // inserts
        if (!this.isSet || this.value === null || this.value === '') return 'required';
      } else if (this.isSet) { // updates
        if (this.operator === '$set' && this.value === null || this.value === '') return 'required';
        if (this.operator === '$unset') return 'required';
        if (this.operator === '$rename') return 'required';
      }

      return null;
    },
  },
  gravatarHash: {
    type: String,
    optional: true,
  },
  invitationState: {
    type: String,
    optional: true,
    allowedValues: ['queuedForSending', 'sent', 'accepted', 'error'],
  },
  invitationError: {
    type: String,
    optional: true,
  },
  invitationToken: {
    type: String,
    optional: true,
  },
  invitationEmailAddress: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email,
    autoform: {
      afFieldInput: {
        label: 'Email address',
        placeholder: 'somebody@example.com',
      },
    },
  },
  role: {
    type: String,
    autoform: {
      afFieldInput: {
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
  getUserName() {
    const user = this.getUser();
    return user && getDisplayedNameForUser(this.getUser()) || this.invitationEmailAddress;
  },
  getIconHTML() {
    if (this.userId) {
      return getIconHTMLForUser(this.getUser());
    }
    return `<img src="${getGravatarImageUrl(this.gravatarHash)}" class='user-icon'>`;
  },
});

if (Meteor.isClient) {
  window.OrganizationMembers = OrganizationMembers;
}
