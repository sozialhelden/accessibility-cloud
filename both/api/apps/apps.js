import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Organizations } from '/both/api/organizations/organizations';
import { AppLinks } from '/both/api/app-links/app-links';
import localizedStringSchema from '../shared/localizedStringSchema';


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
  includeSourceIds: { type: Array },
  'includeSourceIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },
  excludeSourceIds: { type: Array },
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
  textContent: { type: Object },
  'textContent.product': { type: Object },
  'textContent.product.name': localizedStringSchema,
  'textContent.product.claim': localizedStringSchema,
  'textContent.product.description': localizedStringSchema,
  'textContent.onboarding': { type: Object },
  'textContent.onboarding.headerMarkdown': localizedStringSchema,
  'textContent.accessibilityNames': { type: Object, optional: true },
  'textContent.accessibilityNames.long': { type: Object },
  'textContent.accessibilityNames.long.unknown': localizedStringSchema,
  'textContent.accessibilityNames.long.yes': localizedStringSchema,
  'textContent.accessibilityNames.long.limited': localizedStringSchema,
  'textContent.accessibilityNames.long.no': localizedStringSchema,
  'textContent.accessibilityNames.short': { type: Object },
  'textContent.accessibilityNames.short.unknown': localizedStringSchema,
  'textContent.accessibilityNames.short.yes': localizedStringSchema,
  'textContent.accessibilityNames.short.limited': localizedStringSchema,
  'textContent.accessibilityNames.short.no': localizedStringSchema,
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

Apps.apiParameterizedSelector = selector => selector;

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
