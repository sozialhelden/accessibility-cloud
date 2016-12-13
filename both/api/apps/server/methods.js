import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Apps } from '/both/api/apps/apps.js';
import { userHasFullAccessToOrganizationId } from '/both/api/organizations/privileges';

Meteor.methods({
  deleteAppWithId(appId) {
    check(appId, String);
    const app = Apps.findOne({ _id: appId });

    if (!app) {
      throw new Meteor.Error(404, 'API client not found');
    }

    if (!userHasFullAccessToOrganizationId(this.userId, app.organizationId)) {
      throw new Meteor.Error(402, 'Not authorized');
    }

    Apps.remove({ _id: appId });
  },
});
