import { Meteor } from 'meteor/meteor';
import { Sources } from '/both/api/sources/sources.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import { SourceAccessRequests } from '../../source-access-requests.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { requestAccessToSource } from '../invitations';

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
      throw new Meteor.Error(401, 'Please log in first.');
    }

    const source = Sources.findOne({ _id: sourceId });

    if (!source) {
      throw new Meteor.Error(404, 'Source not found');
    }

    if (!source.isRequestable) {
      throw new Meteor.Error(403, 'You cannot request access to this source.');
    }

    const approverOrganizationId = source.organizationId;
    const organization = Organizations.findOne({ _id: approverOrganizationId });
    const approver = organization.getMostAuthoritativeUserThatCanApproveAccessRequests();

    if (!approver) {
      throw new Meteor.Error(500, 'Could not find a user to approve the request');
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
