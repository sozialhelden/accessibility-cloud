import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Organizations } from '/both/api/organizations/organizations';

export const Licenses = new Mongo.Collection('Licenses');

Licenses.schema = new SimpleSchema({
  organizationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: {
    type: String,
    label: 'Official english title',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. Open Special License v1',
      },
    },
    max: 1000,
  },
  shortName: {
    type: String,
    label: 'shortName (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. ODBLv1',
      },
    },
    optional: true,
    max: 1000,
  },
  websiteURL: {
    type: String,
    label: 'Link to descriptive website (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. https://odbl.org/odbl-v1',
      },
    },
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
    max: 1000,
  },
  fullTextURL: {
    type: String,
    label: 'Link to full legal text (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. https://odbl.org/odbl-v1/fulllegal',
      },
    },
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
    max: 1000,
  },
  plainTextSummary: {
    type: String,
    label: 'Plaintext summary (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. The ODBL has the following rules...',
        rows: 10,
      },
    },
    max: 2000,
    optional: true,
  },
  consideredAs: {
    type: String,
    label: 'Considered as...',
    max: 100,
    autoform: {
      afFieldInput: {
        options: [
          { label: 'undefined', value: '' },
          { label: 'Public Domain (CC0)', value: 'CC0' },
          { label: 'Free, with Attribution required (CCBY)', value: 'CCBY' },
          { label: 'Share Alike (CCSA)', value: 'CCSA' },
          { label: 'Restricted ($)', value: 'restricted' },
        ],
      },
    },
  },
});

Licenses.attachSchema(Licenses.schema);

Licenses.publicFields = {
  organizationId: 1,
  name: 1,
  shortName: 1,
  plainTextSummary: 1,
  websiteURL: 1,
  fullTextURL: 1,
  consideredAs: 1,
};

Licenses.helpers({
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
});
