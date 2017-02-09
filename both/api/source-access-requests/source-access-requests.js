import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const SourceAccessRequests = new Mongo.Collection('SourceAccessRequests');

SourceAccessRequests.schema = new SimpleSchema({
  organizationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  sourceId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  requesterId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  message: {
    type: String,
    regEx: /.+/,
  },
  requestState: {
    type: String,
    optional: true,
    allowedValues: ['sent', 'accepted', 'ignored', 'error'],
  },
  requestError: {
    type: String,
    optional: true,
  },
});

SourceAccessRequests.attachSchema(SourceAccessRequests.schema);
