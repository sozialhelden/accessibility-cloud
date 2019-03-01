import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { eventStatusLabels } from './eventStatus';
import { EventRegion } from './events';
import { openForValues } from './eventOpenFor';

export const defaultRegion: EventRegion = {
  topLeft: { latitude: 52.67551, longitude: 13.08835 },
  bottomRight: { latitude: 52.33826, longitude: 13.76116 },
};

export const EventSchema = new SimpleSchema({
  organizationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  sourceId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true, // is set automatically by insertion
  },
  name: {
    type: String,
    max: 1000,
  },
  description: {
    type: String,
    max: 1000,
    optional: true,
  },
  regionName: {
    type: String,
    max: 200,
  },
  region: {
    type: Object,
    optional: true,
    defaultValue: defaultRegion,
    blackbox: true,
  },
  startTime: {
    type: Date,
    optional: true,
  },
  endTime: {
    type: Date,
    optional: true,
  },
  webSiteUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    max: 1000,
    optional: true,
  },
  photoUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    max: 1000,
    optional: true,
  },
  invitationToken: {
    type: String,
    max: 50,
    optional: true, // is set automatically by insertion
  },
  verifyGpsPositionsOfEdits: {
    type: Boolean,
    defaultValue: false,
  },
  targets: {
    type: Object,
    optional: true,
    defaultValue: {
      mappedPlacesCount: 0,
    },
  },
  'targets.mappedPlacesCount': {
    type: Number,
    optional: true,
  },
  status: {
    type: String,
    allowedValues: eventStatusLabels.map(v => v.value),
  },
  openFor: {
    type: String,
    allowedValues: openForValues,
  },
  statistics: {
    optional: true,
    type: Object,
    defaultValue: {
      fullParticipantCount: 0,
      invitedParticipantCount: 0,
      draftParticipantCount: 0,
      acceptedParticipantCount: 0,
      mappedPlacesCount: 0,
    },
  },
  'statistics.fullParticipantCount': {
    type: Number,
  },
  'statistics.invitedParticipantCount': {
    type: Number,
  },
  'statistics.draftParticipantCount': {
    type: Number,
  },
  'statistics.acceptedParticipantCount': {
    type: Number,
  },
  'statistics.mappedPlacesCount': {
    type: Number,
  },
});