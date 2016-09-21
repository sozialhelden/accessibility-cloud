import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { isAdmin } from '/both/lib/is-admin';
import { Organizations } from '/both/api/organizations/organizations';

export const Licenses = new Mongo.Collection('Licenses');

Licenses.allow({
  insert() { return true; }, // FIXME: should be member of organization or admin
  update: isAdmin,
  remove: isAdmin,
});

Licenses.schema = new SimpleSchema({
  organizationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: {
    type: String,
    label: 'Official english title',
    max: 1000,
  },
  shorthand: {
    type: String,
    label: 'Shorthand, e.g. ODbLv1',
    max: 1000,
  },
  version: {
    type: String,
    label: 'Version',
    optional: true,
    max: 10,
  },
  websiteURL: {
    type: String,
    label: 'Link to descriptive website',
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
    max: 1000,
  },
  fullTextURL: {
    type: String,
    label: 'Link to full legal text',
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
    max: 1000,
  },
  plainTextSummary: {
    type: String,
    label: 'Plaintext summary',
    max: 2000,
    optional: true,
  },
  consideredAsCC0: {
    type: String,
    label: 'Considered as Public Domain',
    max: 2000,
    optional: true,
  },
  consideredAsCCA: {
    type: String,
    label: 'Considered as Share Alike',
    max: 2000,
    optional: true,
  },
  consideredAs: {
    type: String,
    label: 'Considered as',
    max: 2000,
    regEx: /^CC0|CCSA|CCA|\?$/,
    optional: true,
  },
  requiresAttribution: {
    type: Boolean,
    label: 'Requires Attribution',
    optional: true,
  },
  requiresShareAlike: {
    type: Boolean,
    label: 'Requires Share-alike',
    optional: true,
  },
  requiresProhibitsStoring: {
    type: Boolean,
    label: 'Prohibits storing',
    optional: true,
  },
});

Licenses.attachSchema(Licenses.schema);

Licenses.publicFields = {
  organizationId: 1,
  name: 1,
  shorthand: 1,
  plainTextSummary: 1,
  version: 1,
  websiteURL: 1,
  fullTextURL: 1,
  consideredAs: 1,
  requiresAttribution: 1,
  requiresShareAlike: 1,
};

Licenses.helpers({
  editableBy: isAdmin,
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
});
