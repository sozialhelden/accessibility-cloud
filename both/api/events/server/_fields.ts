import { omit } from 'lodash';
import { check } from 'meteor/check';

import { isAdmin } from '../../../lib/is-admin';
import { getAccessibleOrganizationIdsForUserId } from '../../organizations/privileges';

export const EventsPrivateFields = {
  organizationId: 1,
  name: 1,
  description: 1,
  regionName: 1,
  region: 1,
  startTime: 1,
  endTime: 1,
  webSiteUrl: 1,
  photoUrl: 1,
  invitationToken: 1,
  verifyGpsPositionsOfEdits: 1,
  targets: 1,
  status: 1,
  openFor: 1,
  statistics: 1,
  meetingPoint: 1,
};

export const EventsPublicFields = omit(EventsPrivateFields, 'invitationToken');

export function buildVisibleForUserByEventIdSelector(
  userId: string | null,
  eventId: Mongo.ObjectID
): Mongo.Selector<any> | null {
  // always sanitize to ensure no injection is possible from params (e.g. sending {$ne: -1} as an object)
  check(eventId, String);

  if (!userId) {
    return null;
  }

  // admins can see all events
  if (isAdmin(userId)) {
    return { _id: eventId };
  }

  // get all the orgs a user can access
  const userOrganizationIds = getAccessibleOrganizationIdsForUserId(userId);
  // select the event, if the user is allowed to access with the organizations
  return { _id: eventId, organizationId: { $in: userOrganizationIds } };
}

export function buildVisibleForUserByOrganizationIdSelector(
  userId: string | null,
  organizationId: Mongo.ObjectID
): Mongo.Selector<any> | null {
  // always sanitize to ensure no injection is possible from params (e.g. sending {$ne: -1} as an object)
  check(organizationId, String);

  if (!userId) {
    return null;
  }

  // admins can see all the participants of any event
  if (isAdmin(userId)) {
    return { organizationId };
  }

  // get all the orgs a user can access
  const userOrganizationIds = getAccessibleOrganizationIdsForUserId(userId);
  // select all the events the user is allowed to access with the organizations
  return { organizationId: { $in: userOrganizationIds } };
}

export function buildVisibleForPublicByOrganizationIdSelector(
  userId: string | null,
  organizationId: Mongo.ObjectID
) {
  // always sanitize to ensure no injection is possible from params (e.g. sending {$ne: -1} as an object)
  check(organizationId, String);

  return { organizationId, status: { $ne: 'draft' } };
}

export function buildVisibleForPublicByEventIdSelector(
  userId: string | null,
  eventId: Mongo.ObjectID
): Mongo.Selector<any> | null {
  // always sanitize to ensure no injection is possible from params (e.g. sending {$ne: -1} as an object)
  check(eventId, String);

  // TODO hide drafts

  return { _id: eventId };
}
