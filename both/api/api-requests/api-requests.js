import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const ApiRequests = new Mongo.Collection('ApiRequests');

ApiRequests.schema = new SimpleSchema({
  appId: { type: SimpleSchema.RegEx.Id, optional: true },
  userId: { type: SimpleSchema.RegEx.Id, optional: true },
  organizationId: { type: SimpleSchema.RegEx.Id, optional: true },
  appToken: { type: String, optional: true },
  userToken: { type: String, optional: true },
  hashedIp: { type: String },
  timestamp: { type: Date },
  responseSize: { type: Number },
  statusCode: { type: Number },
  duration: { type: Number, decimal: true },
  query: { type: Object, optional: true, blackbox: true },
  headers: { type: Object, optional: true, blackbox: true },
});

ApiRequests.attachSchema(ApiRequests.schema);
