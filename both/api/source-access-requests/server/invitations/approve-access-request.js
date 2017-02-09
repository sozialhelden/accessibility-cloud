import { Meteor } from 'meteor/meteor';
import { _ } from 'lodash';
import { Email } from 'meteor/email';
import { SourceAccessRequests } from '../../source-access-requests';
import { Organizations } from '/both/api/organizations/organizations';
import { Sources } from '/both/api/sources/sources';

const approvalEmailBody = ({
  organizationName,
  sourceName,
  sourceId,
}) =>
`Hi,

your request to access data source “${organizationName}/${sourceName}” on accessibility.cloud has been approved!

Use this link to access the source:

${
  Meteor.absoluteUrl(
    `sources/${sourceId}`,
    { secure: true }
  )
}

All the best,
Your accessibility.cloud team.`;

export default function approveAccessRequest({
  requestId,
  requester,
  organizationId,
  sourceId,
}) {
  const selector = { _id: requestId };

  if (!requester) {
    console.log(`Request from user ${requester._id} ` +
                `to access source ${sourceId} ignored ` +
                'since user cannot be found.');
    return;
  }

  const requesterEmailAddress = requester.emails[0].address;
  const source = Sources.findOne({ _id: sourceId });
  const sourceName = source.name;
  const organization = Organizations.findOne(source.organizationId);

  SourceAccessRequests.update(selector, {
    $set: {
      requestState: 'accepted',
    },
  });

  Sources.update(sourceId, {
    $set: {
      accessRestrictedTo: _.uniq(
        (source.accessRestrictedTo || []).concat(organizationId)
      ),
    },
  });

  try {
    Email.send({
      from: 'support@accessibility.cloud',
      to: requesterEmailAddress,
      subject: `Your request to access source “${source.name}” has been approved!`,
      text: approvalEmailBody({
        organizationName: organization.name,
        sourceName,
        sourceId,
      }),
    });
  } catch (error) {
    throw new Error('MAIL_NOT_SENT');
  }
}
