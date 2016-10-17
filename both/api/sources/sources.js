import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Organizations } from '/both/api/organizations/organizations';

import { _ } from 'meteor/underscore';

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
  name: {
    label: 'Name',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. Places in Europe',
      },
    },
    type: String,
  },
  licenseId: {
    label: 'License',
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  languageId: {
    label: 'Primary Language',
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  description: {
    label: 'Description',
    type: String,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. This source shares information about...',
        rows: 10,
      },
    },
    optional: true,
  },
  originWebsite: {
    label: 'Web-site (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. https://some.site.com/1234',
      },
    },
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  isDraft: {
    type: Boolean,
    label: 'Only a draft (not listed in publicly)',
    defaultValue: true,
  },
  tocForSourcesAccepted: {
    type: Boolean,
    label: 'I have read and agreed to the Terms & Conditions. '
         + 'Esp. that I am the owner of the data or have the right to publish it.',
  },
  streamChain: {
    type: Array,
    label: 'Stream chain setup',
    optional: true,
  },
  'streamChain.$': {
    type: Object,
    blackbox: true,
  },
  'streamChain.$.type': {
    type: String,
  },
  isFreelyAccessible: {
    type: Boolean,
    label: 'Data is available to everybody',
    defaultValue: true,
  },
  accessRestrictedTo: {
    type: [String],
    label: 'Data is available to everybody',
    defaultValue: [],
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
      afFormGroup: {
        label: false,
      },
    },
  },
});

Sources.attachSchema(Sources.schema);

Sources.publicFields = {
  organizationId: 1,
  licenseId: 1,
  name: 1,
  description: 1,
  originWebsite: 1,
  isDraft: 1,
  tocForSourcesAccepted: 1,
  streamChain: 1,
  isFreelyAccessible: 1,
  accessRestrictedTo: 1,
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
  inputMimeType() {
    const downloadItem = _.find(this.streamChain, chainItem => chainItem.type === 'HTTPDownload');
    return (downloadItem && downloadItem.parameters && downloadItem.parameters.inputMimeType);
  },
  inputMimeTypeName() {
    switch (this.inputMimeType()) {
      case 'application/json': return 'JSON';
      case 'text/csv': return 'CSV';
      default: return '(Unknown format)';
    }
  },
});
