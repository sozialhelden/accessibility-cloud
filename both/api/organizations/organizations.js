import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
// import { Factory } from 'meteor/factory';
import { Sources } from '/both/api/sources/sources';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';

import { countriesOfTheWorld } from '/both/lib/all-countries';
import { _ } from 'meteor/underscore';

export const Organizations = new Mongo.Collection('Organizations');

// Deny all client-side updates since we will be using methods to manage this collection
// Organizations.deny({
//   insert() { return true; },
//   update() { return true; },
//   remove() { return true; },
// });


// FIXME: WARNING, these need to be fixed
Organizations.allow({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


Organizations.schema = new SimpleSchema({
  name: {
    label: 'Name of company or individual',
    type: String,
    max: 1000,
    optional: true,
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
  tocFororganizationsAccepted: {
    label: 'I have read and agree to the teams and conditions',
    type: Boolean,
  },
});

Organizations.attachSchema(Organizations.schema);

// This represents the keys from Organizations objects that should be published
// to the client. If we add secret properties to Organization objects, don't organization
// them here to keep them private to the server.
Organizations.publicFields = {
  name: 1,
  address: 1,
  addressAdditional: 1,
  zipCode: 1,
  city: 1,
  country: 1,
  phoneNumber: 1,
  webSite: 1,
  description: 1,
  tocFororganizationsAccepted: 1,
};

Organizations.visibleSelectorFor = () => ({});

Organizations.helpers({
  editableBy(userId) {
    return true || userId;  // FIXME: allow editing only for members and admins of organization
  },
  getSources() {
    return Sources.find({ organizationId: this._id });
  },
});
