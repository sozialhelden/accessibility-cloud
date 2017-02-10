import { Meteor } from 'meteor/meteor';
import { _ } from 'lodash';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Organizations } from '/both/api/organizations/organizations.js';
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

SourceAccessRequests.helpers({
  requesterOrganization() {
    return Organizations.findOne(this.organizationId).name;
  },
  email() {
    const requester = Meteor.users.findOne(this.requesterId);
    return _.get(requester, 'emails[0].address');
  },
});

SourceAccessRequests.attachSchema(SourceAccessRequests.schema);
