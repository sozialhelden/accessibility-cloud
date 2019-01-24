import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Organizations } from '/both/api/organizations/organizations';
import { AppLinks } from '/both/api/app-links/app-links';
import LocalizedStringSchema from '../shared/LocalizedStringSchema';

export const Apps = new Mongo.Collection('Apps');

const clientSideConfiguration = new SimpleSchema({
  logoURL: {
    label: 'Logo URL',
    type: String,
    optional: true,
  },
  iconURL: {
    label: 'Icon URL',
    type: String,
    optional: true,
  },
  includeSourceIds: { type: Array, optional: true },
  'includeSourceIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },
  excludeSourceIds: { type: Array, optional: true },
  'excludeSourceIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },
  meta: { type: Object, optional: true },
  'meta.twitter': { type: Object, optional: true },
  'meta.twitter.siteHandle': { type: String, optional: true },
  'meta.twitter.creatorHandle': { type: String, optional: true },
  'meta.twitter.imageURL': { type: String, optional: true },
  'meta.facebook': { type: Object, optional: true },
  'meta.facebook.appId': { type: String, optional: true },
  'meta.facebook.admins': { type: String, optional: true },
  'meta.facebook.imageURL': { type: String, optional: true },
  'meta.googleAnalytics': { type: Object, optional: true },
  'meta.googleAnalytics.trackingId': { type: String, optional: true },
  'meta.googleAnalytics.siteVerificationToken': { type: String, optional: true },
  textContent: { type: Object, optional: true },
  'textContent.product': { type: Object, optional: true },
  'textContent.product.name': LocalizedStringSchema,
  'textContent.product.claim': LocalizedStringSchema,
  'textContent.product.description': LocalizedStringSchema,
  'textContent.onboarding': { type: Object, optional: true },
  'textContent.onboarding.headerMarkdown': LocalizedStringSchema,
  'textContent.accessibilityNames': { type: Object, optional: true },
  'textContent.accessibilityNames.long': { type: Object, optional: true },
  'textContent.accessibilityNames.long.unknown': LocalizedStringSchema,
  'textContent.accessibilityNames.long.yes': LocalizedStringSchema,
  'textContent.accessibilityNames.long.limited': LocalizedStringSchema,
  'textContent.accessibilityNames.long.no': LocalizedStringSchema,
  'textContent.accessibilityNames.short': { type: Object, optional: true },
  'textContent.accessibilityNames.short.unknown': LocalizedStringSchema,
  'textContent.accessibilityNames.short.yes': LocalizedStringSchema,
  'textContent.accessibilityNames.short.limited': LocalizedStringSchema,
  'textContent.accessibilityNames.short.no': LocalizedStringSchema,
  addPlaceURL: { type: String, regEx: SimpleSchema.RegEx.Url, optional: true },
});


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
  clientSideConfiguration: { type: clientSideConfiguration, optional: true },
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

Apps.apiParameterizedSelector = ({ selector }) => selector;

Apps.relationships = {
  hasMany: {
    appLinks: {
      foreignCollection: AppLinks,
      foreignKey: 'appId',
    },
  },
};

if (Meteor.isClient) {
  window.Apps = Apps;
}
