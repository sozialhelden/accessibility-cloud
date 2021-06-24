import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { PointGeometrySchema } from '@sozialhelden/a11yjson';
import UserAgentSchema from './UserAgentSchema';

export const TrackingEvents = new Mongo.Collection('TrackingEvents');

TrackingEvents.schema = new SimpleSchema({
  type: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
  userUUID: {
    type: String,
  },
  hashedIp: {
    type: String,
    optional: true,
  },
  geometry: {
    type: Object,
    optional: true,
  },
  'geometry.type': {
    type: String,
    allowedValues: ['Point'],
  },
  'geometry.coordinates': {
    type: Array,
  },
  'geometry.coordinates.$': {
    type: Number,
    decimal: true,
  },
  latitude: {
    type: Number,
    optional: true,
    decimal: true,
  },
  longitude: {
    type: Number,
    optional: true,
    decimal: true,
  },
  userAgent: {
    type: UserAgentSchema,
    optional: true,
  },
  // event specific data
  appId: {
    type: String,
    optional: true,
  },
  sourceId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
  },
  campaignId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
  },
  mappingEvent: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  'mappingEvent._id': {
    type: SimpleSchema.RegEx.Id,
  },
  organizationId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
  },
  attributePath: {
    type: String,
    optional: true,
  },
  placeInfoId: {
    type: String,
    optional: true,
  },
  previousValue: {
    type: SimpleSchema.any,
    blackbox: true,
    optional: true,
  },
  newValue: {
    type: SimpleSchema.any,
    blackbox: true,
    optional: true,
  },
  category: {
    type: String,
    optional: true,
  },
  parentCategory: {
    type: String,
    optional: true,
  },
  uniqueSurveyId: {
    type: String,
    optional: true,
    custom() {
      if (this.field('type').value === 'SurveyCompleted' && !this.value) {
        return 'Missing key `uniqueSurveyId` for type `SurveyCompleted`';
      }
      return undefined;
    },
  },
  joinedMappingEventId: {
    type: String,
    optional: true,
    custom() {
      if (this.field('type').value === 'MappingEventJoined' && !this.value) {
        return 'Missing key `joinedMappingEventId` for type `MappingEventJoined`';
      }
      return undefined;
    },
  },
  joinedVia: {
    type: String,
    optional: true,
    custom() {
      if (this.field('type').value === 'MappingEventJoined' && !this.value) {
        return 'Missing key `joinedVia` for type `MappingEventJoined`';
      }
      return undefined;
    },
  },
  leftMappingEventId: {
    type: String,
    optional: true,
    custom() {
      if (this.field('type').value === 'MappingEventLeft' && !this.value) {
        return 'Missing key `leftMappingEventId` for type `MappingEventLeft`';
      }
      return undefined;
    },
  },
  data: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  query: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  emailAddress: {
    type: String,
    optional: true,
  },
  invitationToken: {
    type: String,
    optional: true,
  },
});


TrackingEvents.attachSchema(TrackingEvents.schema);
