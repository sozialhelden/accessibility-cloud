import { Mongo } from 'meteor/mongo';

import { MappingEventSchema } from './schema';
import { mappingEventStatusEnum } from './mappingEventStatus';
import { EventOpenForEnum } from './eventOpenFor';

export type EventRegion = {
  topLeft: { latitude: number; longitude: number };
  bottomRight: { latitude: number; longitude: number };
};  

export interface IMappingEventStatistics {
  fullParticipantCount: number;
  invitedParticipantCount: number;
  draftParticipantCount: number;
  acceptedParticipantCount: number;
  mappedPlacesCount: number;
}

export interface IMappingEvent {
  // mongo id
  _id?: string;
  // fields
  organizationId: Mongo.ObjectID;
  sourceId: Mongo.ObjectID;
  name: string;
  description?: string;
  welcomeMessage?: string;
  meetingPoint?: any;
  area?: any;
  startTime?: Date;
  endTime?: Date;
  webSiteUrl?: string;
  photos?: any[];
  invitationToken?: string;
  targets?: {
    mappedPlacesCount?: number;
  };
  status: mappingEventStatusEnum;
  openFor: EventOpenForEnum;
  statistics: IMappingEventStatistics;
}

export const MappingEvents = new Mongo.Collection('MappingEvents');
MappingEvents.schema = MappingEventSchema;
MappingEvents.attachSchema(MappingEventSchema);
