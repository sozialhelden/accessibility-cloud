import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const UploadedFiles = new Mongo.Collection('UploadedFiles');

// Deny all client-side updates since we will be using methods to manage this collection
UploadedFiles.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

UploadedFiles.schema = new SimpleSchema({
  storageUrl: {
    label: 'Storage URL',
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  remotePath: {
    label: 'Remote path (without base URL)',
    type: String,
  },
  userId: {
    label: 'Uploading user',
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  metadata: {
    type: Object,
    blackbox: true,
  },
});

UploadedFiles.attachSchema(UploadedFiles.schema);

UploadedFiles.publicFields = {};
