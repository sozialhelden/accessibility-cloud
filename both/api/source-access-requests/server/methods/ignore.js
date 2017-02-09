import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Sources } from '/both/api/sources/sources.js';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { SourceAccessRequests } from '../../source-access-requests.js';
import { TAPi18n } from 'meteor/tap:i18n';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ignoreAccessRequest } from '../invitations';

export const approve = new ValidatedMethod({
  name: 'sourceAccessRequests.ignore',
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
      sourceId,
    } = sourceAccessRequest;
    const requester = Meteor.users.findOne(requesterId);

    console.log(`Ignoring Request from user ${requester._id} to access source ${sourceId} `);

    try {
      ignoreAccessRequest({
        requestId,
      });
    } catch (e) {
      const message = `The request could not be ignored because of an error.\n ${e.message}`;

      throw new Meteor.Error(500, TAPi18n.__(message));
    }
  },
});
