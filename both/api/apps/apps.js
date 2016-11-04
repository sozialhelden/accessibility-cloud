import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Organizations } from '/both/api/organizations/organizations';
import { isAdmin } from '/both/lib/is-admin';

export const Apps = new Mongo.Collection('Apps');

Apps.schema = new SimpleSchema({
  tokenString: {
    type: String,
    optional: true,
  },
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
  websiteURL: {
    label: 'Website (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'http://a11y-gourmet.org',
      },
    },
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  tocForAppsAccepted: {
    type: Boolean,
    autoform: {
      label: false,
      type: 'tos-checkbox',
    },
    allowedValues: [true],
  },
});
Apps.schema.messages({
  notAllowed: 'Sorry, but this is not a valid option.',
});

Apps.attachSchema(Apps.schema);

Apps.helpers({
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
});
