import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Email } from 'meteor/email';
import { SourceAccessRequests } from '../../source-access-requests';
import { Organizations } from '/both/api/organizations/organizations';
import { Sources } from '/both/api/sources/sources';

const invitationEmailBody = ({
  requesterEmailAddress,
  sourceId,
  sourceName,
  approverOrganizationName,
  requesterOrganizationName,
}) =>
`Hi,

${requesterEmailAddress}, a member of organization “${requesterOrganizationName}”
on accessibility.cloud, has requested access for their organization
to “${approverOrganizationName}/${sourceName}” .

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
  organizationId,
  approverId,
  source,
  message,
}) {
  const approver = Meteor.users.findOne(approverId);
  const requester = Meteor.users.findOne(requesterId);

  const requesterOrganization = Organizations.findOne(organizationId);
  const approverOrganization = Organizations.findOne(source.organizationId);

  const approverEmailAddress = approver.emails[0].address;
  const requesterEmailAddress = requester.emails[0].address;

  const requestId = SourceAccessRequests.insert({
    organizationId,
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
        approverOrganizationName: approverOrganization.name,
        requesterOrganizationName: requesterOrganization.name,
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
        requestError: _.pick(error, 'message'),
      },
    });
  }
}

export default function requestAccessToSource({
  requesterId,
  organizationId,
  approverId,
  sourceId,
  message,
}) {
  const source = Sources.findOne({ _id: sourceId });
  const thereIsNoNeedForRequestingAccess = source.isFullyVisibleForUserId(requesterId)
                                            || source.hasRestrictedAccessForUserId(requesterId);

  if (thereIsNoNeedForRequestingAccess) {
    console.log(`User ${requesterId} already has access to source ${sourceId}. Ignoring request.`);
    return;
  }

  sendAccessRequestEmailTo({
    requesterId,
    organizationId,
    approverId,
    source,
    message,
  });
}
