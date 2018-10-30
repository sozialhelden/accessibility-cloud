import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Organizations } from '/both/api/organizations/organizations';

export const Apps = new Mongo.Collection('Apps');

const linkSchema = new SimpleSchema({
  label: { type: String },
  url: { type: String, regEx: SimpleSchema.RegEx.Url },
});

const LocalizableString = new SimpleSchema({
  $: { type: String },
});

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
  'textContent.product.name': { type: LocalizableString },
  'textContent.product.claim': { type: LocalizableString },
  'textContent.product.description': { type: LocalizableString },
  'textContent.onboarding': { type: Object },
  'textContent.onboarding.headerMarkdown': { type: LocalizableString },
  'textContent.accessibilityNames': { type: Object, optional: true },
  'textContent.accessibilityNames.long': { type: Object },
  'textContent.accessibilityNames.long.unknown': { type: LocalizableString },
  'textContent.accessibilityNames.long.yes': { type: LocalizableString },
  'textContent.accessibilityNames.long.limited': { type: LocalizableString },
  'textContent.accessibilityNames.long.no': { type: LocalizableString },
  'textContent.accessibilityNames.short': { type: Object },
  'textContent.accessibilityNames.short.unknown': { type: LocalizableString },
  'textContent.accessibilityNames.short.yes': { type: LocalizableString },
  'textContent.accessibilityNames.short.limited': { type: LocalizableString },
  'textContent.accessibilityNames.short.no': { type: LocalizableString },
  customMainMenuLinks: { type: Array },
  'customMainMenuLinks.$': { type: linkSchema },
  addPlaceURL: { type: String, regEx: SimpleSchema.RegEx.Url },
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

if (Meteor.isClient) {
  window.Apps = Apps;
}
