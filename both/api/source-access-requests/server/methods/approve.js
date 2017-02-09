import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Sources } from '/both/api/sources/sources.js';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { SourceAccessRequests } from '../../source-access-requests.js';
import { TAPi18n } from 'meteor/tap:i18n';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { approveAccessRequest } from '../invitations';

export const approve = new ValidatedMethod({
  name: 'sourceAccessRequests.approve',
  validate: new SimpleSchema({
    requestId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ requestId }) {
    if (!this.userId) {
      throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
    }

    const sourceAccessRequest = SourceAccessRequests.findOne(requestId);
    if (!sourceAccessRequest) {
      throw new Meteor.Error(404, TAPi18n.__('Access Request not found'));
    }

    const source = Sources.findOne(sourceAccessRequest.sourceId);
    if (!source) {
      throw new Meteor.Error(404, TAPi18n.__('Source ${sourceAccessRequest.sourceId} not found'));
    }

    const approverOrganizationId = source.organizationId;

    const isOrganizationMember = Boolean(OrganizationMembers.findOne({
      organizationId: approverOrganizationId,
      userId: this.userId,
    }));

    if (!isOrganizationMember) {
      throw new Meteor.Error(403,
        TAPi18n.__('You cannot approve access requests for this source.'));
    }

    const {
      requesterId,
      organizationId,
      sourceId,
    } = sourceAccessRequest;
    const approverId = this.userId;

    console.log(`Approving request to access source ${sourceId}` +
                `as organization member ${approverId} ` +
                `for requester ${requesterId} of organization ${organizationId}`);

    const requester = Meteor.users.findOne(requesterId);

    try {
      approveAccessRequest({
        requestId,
        requester,
        organizationId,
        sourceId,
      });
    } catch (e) {
      const requesterEmail = requester.emails[0].address;

      const message = e.message === 'MAIL_NOT_SENT' ?
        'The request was successfully approved ' +
        `but there was an issue sending an email to the requester at ${requesterEmail}`
        :
        `The request could not be approved because of an error.\n ${e.message}`;

      throw new Meteor.Error(500, TAPi18n.__(message));
    }
  },
});
