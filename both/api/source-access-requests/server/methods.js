import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Sources } from '/both/api/sources/sources.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import { SourceAccessRequests } from '../source-access-requests.js';
import { TAPi18n } from 'meteor/tap:i18n';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { requestAccessToSource } from './invitations';

SimpleSchema.debug = true;

export const askForAccess = new ValidatedMethod({
  name: 'sourceAccessRequests.askForAccess',
  validate: SourceAccessRequests.simpleSchema()
    .pick([
      'sourceId',
      'requesterId',
      'message',
    ])
    .validator(),
  run({ requesterId, sourceId, message }) {
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

    const organizationId = source.organizationId;
    const organization = Organizations.findOne({ _id: organizationId });
    const approver = organization.getMostAuthoritativeUserThatCanApproveAccessRequests();

    if (!approver) {
      throw new Meteor.Error(500, TAPi18n.__('Could not find a user to approve the request'));
    }

    console.log(`Sending access request for source ${sourceId}` +
                `to organization member ${approver._id} ` +
                `on behalf of requester ${requesterId}`);

    requestAccessToSource({
      requesterId,
      approverId: approver._id,
      sourceId,
      message,
    });
  },
});
