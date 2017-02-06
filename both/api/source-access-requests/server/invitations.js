import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { SourceAccessRequests } from '../source-access-requests';
import { Organizations } from '/both/api/organizations/organizations';
import { Sources } from '/both/api/sources/sources';

const invitationEmailBody = ({ requesterEmailAddress, sourceId, sourceName, organizationName }) =>
`Hi,

${requesterEmailAddress} has requested access to “${organizationName}/${sourceName}” on accessibility.cloud.

Use this link to see pending access requests for this source:

${
  Meteor.absoluteUrl(
    `sources/${sourceId}/access`,
    { secure: true }
  )
}

All the best,
Your accessibility.cloud team.
`;

function sendAccessRequestEmailTo({
  requesterId,
  approverId,
  source,
  message,
}) {
  const approver = Meteor.users.findOne(approverId);
  const requester = Meteor.users.findOne(requesterId);
  const approverEmailAddress = approver.emails[0].address;
  const requesterEmailAddress = requester.emails[0].address;
  const organization = Organizations.findOne(source.organizationId);

  const requestId = SourceAccessRequests.insert({
    organizationId: source.organizationId,
    sourceId: source._id,
    requesterId,
    message,
  });

  const selector = { _id: requestId };

  try {
    Email.send({
      from: 'support@accessibility.cloud',
      to: approverEmailAddress,
      subject: `${requesterEmailAddress} is requesting access to source “${source.name}”`,
      text: invitationEmailBody({
        requesterEmailAddress,
        sourceId: source._id,
        sourceName: source.name,
        organizationName: organization.name,
      }),
    });

    SourceAccessRequests.update(selector, {
      $set: {
        requestState: 'sent',
      },
    });
  } catch (error) {
    SourceAccessRequests.update(selector, {
      $set: {
        requestState: 'error',
        requestError: error,
      },
    });
  }
}

export function requestAccessToSource({ requesterId, approverId, sourceId, message }) {
  const source = Sources.findOne({ _id: sourceId });
  const thereIsNoNeedForRequestingAccess = source.isFullyVisibleForUserId(requesterId)
                                            || source.hasRestrictedAccessForUserId(requesterId);

  if (thereIsNoNeedForRequestingAccess) {
    console.log(`User ${requesterId} already has access to source ${sourceId}. Ignoring request.`);
    return;
  }

  sendAccessRequestEmailTo({
    requesterId,
    approverId,
    source,
    message,
  });
}
