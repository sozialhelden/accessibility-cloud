import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { PlaceInfos } from '../place-infos/place-infos';

export const Images = new Mongo.Collection('Images');

Images.schema = new SimpleSchema({
  objectId: {
    type: String,
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
  appToken: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
  mimeType: {
    type: String,
  },
  remotePath: {
    label: 'Remote path (without base URL)',
    type: String,
  },
  s3Error: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  isUploadedToS3: {
    type: Boolean,
  },
});

Images.attachSchema(Images.schema);

export const buildFullImageUrl = (image) => {
  if (Meteor.settings.public.aws.s3.bucketEndpoint) {
    return `${Meteor.settings.public.aws.s3.bucketEndpoint}/${image.remotePath}`;
  }
  return `https://${Meteor.settings.public.aws.s3.bucket}.${Meteor.settings.public.aws.region}.amazonaws.com/${image.remotePath}`;
};

Images.helpers({
  getPlace() {
    return PlaceInfos.findOne(this.placeId);
  },
  shortIp() {
    return this.hashedIp.substring(0, 8);
  },
  uploadedAt() {
    return this.timestamp.toISOString();
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
