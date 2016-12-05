import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Sources } from '/both/api/sources/sources';
import { Apps } from '/both/api/apps/apps';
import { countriesOfTheWorld } from '/both/lib/all-countries';
import { isAdmin } from '/both/lib/is-admin';
import {
  userHasFullAccessToOrganizationId,
  isUserMemberOfOrganizationWithId,
} from '/both/api/organizations/privileges';


export const Organizations = new Mongo.Collection('Organizations');

Organizations.schema = new SimpleSchema({
  name: {
    label: 'Name of company or individual',
    type: String,
    max: 1000,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. xyz123 Inc.',
      },
    },
  },
  address: {
    label: 'Address',
    type: String,
    max: 1000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. Adam-Riese-St. 27',
      },
    },
  },
  addressAdditional: {
    label: 'Address (Additional)',
    type: String,
    max: 1000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. 1st floor',
      },
    },
  },
  zipCode: {
    label: 'ZIP-Code',
    type: String,
    max: 1000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. 12345',
      },
    },
  },
  city: {
    label: 'City',
    type: String,
    optional: true,
    max: 100,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. Berlin',
      },
    },
  },
  country: {
    label: 'Country',
    type: String,
    optional: true,
    max: 100,
    autoform: {
      afFieldInput: {
        options: countriesOfTheWorld,
      },
    },
  },
  phoneNumber: {
    label: 'Phone number',
    type: String,
    max: 100,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. +49-30-123455667',
      },
    },
  },
  webSite: {
    label: 'Web-Site',
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    max: 1000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. https://xyz123.org',
      },
    },
  },
  description: {
    label: 'Short description (optional)',
    type: String,
    max: 2000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. XYZ123 Inc. is a small entity that is often referred to a primary example for...',
        rows: 5,
      },
    },
  },
  tocForOrganizationsAccepted: {
    type: Boolean,
    autoform: {
      label: false,
      type: 'tos-checkbox',
    },
    allowedValues: [true],
  },
});

Organizations.schema.messages({
  notAllowed: 'Sorry, but this is not a valid option.',
});

Organizations.helpers({
  editableBy(userId) {
    check(userId, String);
    return userHasFullAccessToOrganizationId(userId, this._id);
  },
});


Organizations.attachSchema(Organizations.schema);

Organizations.helpers({
  isFullyVisibleForUserId(userId) {
    return isAdmin(userId) || isUserMemberOfOrganizationWithId(userId, this._id);
  },
  getSources() {
    return Sources.find({ organizationId: this._id });
  },
  getApps() {
    return Apps.find({ organizationId: this._id });
  },
});

if (Meteor.isServer) {
  Organizations._ensureIndex({ tocForOrganizationsAccepted: 1 });
}
