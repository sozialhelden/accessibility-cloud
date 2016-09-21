import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { isAdmin } from '/both/lib/is-admin';

export const Licenses = new Mongo.Collection('Licenses');

Licenses.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

Licenses.schema = new SimpleSchema({
  name: {
    type: String,
    label: "Official english title",
    max: 1000,
  },
  shorthand: {
    type: String,
    label: 'Shorthand, e.g. ODbLv1',
    max: 1000,
  },
  version: {
    type: String,
    label: 'Shorthand, e.g. ODbLv1',
    max: 10,
  },
  websiteURL: {
    type: String,
    label: 'Link to descriptive website',
    regEx: SimpleSchema.RegEx.Url,
    max: 1000,
  },
  fullTextURL: {
    type: String,
    label: 'Link to full legal text',
    regEx: SimpleSchema.RegEx.Url,
    max: 1000,
  },
  plainTextSummary: {
    type: String,
    label: 'Plaintext summary',
    max: 2000,
  },
  consideredAsCC0: {
    type: String,
    label: 'Plaintext summary',
    max: 2000,
  },
  consideredAsCCA: {
    type: String,
    label: 'Plaintext summary',
    max: 2000,
  },
  consideredAs: {
    type: String,
    label: 'Considered as',
    max: 2000,
    regEx: /^CC0|CCSA|CCA|\?$/,
  },
  requiresAttribution: {
    type: Boolean,
    label: 'Requires Attribution',
  },
  requiresShareAlike: {
    type: Boolean,
    label: 'Requires Share-alike',
  },
  requiresProhibitsStoring: {
    type: Boolean,
    label: 'Prohibits storing',
  },
});

Licenses.attachSchema(Licenses.schema);

Licenses.publicFields = {
  name: 1,
  text: 1,
};

Licenses.helpers({
  editableBy: isAdmin,
});
