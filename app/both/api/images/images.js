import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { PlaceInfos } from '../place-infos/place-infos';

export const Images = new Mongo.Collection('Images');

Images.schema = new SimpleSchema({
  originalId: {
    type: String,
    optional: true,
  },
  objectId: {
    type: String,
  },
  objectSourceId: {
    type: String,
    optional: true,
  },
  hashedIp: {
    type: String,
  },
  context: {
    type: String,
    allowedValues: [
      'place',
    ],
  },
  moderationRequired: {
    type: Boolean,
  },
  reports: {
    type: Array,
    optional: true,
  },
  'reports.$': {
    type: Object,
  },
  'reports.$.hashedIp': {
    type: String,
  },
  'reports.$.reason': {
    type: String,
  },
  'reports.$.timestamp': {
    type: Date,
  },
  dimensions: {
    type: Object,
  },
  'dimensions.width': {
    type: Number,
  },
  'dimensions.height': {
    type: Number,
  },
  appToken: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    optional: true,
  },
  mimeType: {
    type: String,
  },
  remotePath: {
    label: 'Remote path (without base URL)',
    type: String,
  },
  remoteUrl: {
    type: String,
    optional: true,
  },
  remoteEtag: {
    type: String,
    optional: true,
  },
  s3Error: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  isUploadedToS3: {
    type: Boolean,
  },
  originalSourceUrl: {
    type: String,
    optional: true,
  },
  sourceId: {
    type: String,
    optional: true,
  },
  sourceImportId: {
    type: String,
    optional: true,
  },
  sourceName: {
    type: String,
    optional: true,
  },
  organizationName: {
    type: String,
    optional: true,
  },
});

Images.attachSchema(Images.schema);

export const buildFullImageUrl = (image) => {
  if (Meteor.settings.public.aws.s3.bucketEndpoint) {
    return `${Meteor.settings.public.aws.s3.bucketEndpoint}/${image.remotePath}`;
  }
  return `https://${Meteor.settings.public.aws.s3.bucket}.s3.amazonaws.com/${image.remotePath}`;
};

Images.helpers({
  getContextObject() {
    if (this.context === 'place') {
      return PlaceInfos.findOne(this.objectId);
    }
    return null;
  },
  shortIp() {
    return this.hashedIp.substring(0, 8);
  },
  readableUploadedAt() {
    return this.timestamp.toISOString();
  },
  readableUpdateddAt() {
    return (this.updatedAt || this.timestamp).toISOString();
  },
  fullUrl() {
    return buildFullImageUrl(this);
  },
});

Images.publicFields = {};

export const DefaultModerationFilter = {
  moderationRequired: true,
  isUploadedToS3: true,
};

if (Meteor.isClient) {
  window.Images = Images;
}
