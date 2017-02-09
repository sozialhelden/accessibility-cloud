import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Sources } from '/both/api/sources/sources.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { SourceAccessRequests } from '../source-access-requests.js';
import { TAPi18n } from 'meteor/tap:i18n';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { requestAccessToSource, approveAccessRequest } from './invitations';

SimpleSchema.debug = true;

export const askForAccess = new ValidatedMethod({
  name: 'sourceAccessRequests.askForAccess',
  validate: SourceAccessRequests.simpleSchema()
    .pick([
      'requesterId',
      'organizationId',
      'sourceId',
      'message',
    ])
    .validator(),
  run({
    requesterId,
    organizationId,
    sourceId,
    message,
  }) {
    if (!this.userId) {
      throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
    }

    const source = Sources.findOne({ _id: sourceId });

    if (!source) {
      throw new Meteor.Error(404, TAPi18n.__('Source not found'));
    }

    if (!source.isRequestable) {
      throw new Meteor.Error(403,
        TAPi18n.__('You cannot request access to this source.'));
    }

    const approverOrganizationId = source.organizationId;
    const organization = Organizations.findOne({ _id: approverOrganizationId });
    const approver = organization.getMostAuthoritativeUserThatCanApproveAccessRequests();

    if (!approver) {
      throw new Meteor.Error(500, TAPi18n.__('Could not find a user to approve the request'));
    }

    console.log(`Sending access request for source ${sourceId}` +
                `to organization member ${approver._id} ` +
                `on behalf of requester ${requesterId}`);

    requestAccessToSource({
      requesterId,
      organizationId,
      approverId: approver._id,
      sourceId,
      message,
    });
  },
});


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
