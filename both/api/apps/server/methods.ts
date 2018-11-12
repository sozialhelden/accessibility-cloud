import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { userHasFullAccessToOrganizationId } from '../../../../both/api/organizations/privileges';
import { Apps } from '../apps';

function getAppAndEnsureAccess(userId: string, appId: string) {
  const app = Apps.findOne({ _id: appId });

  if (!app) {
    throw new Meteor.Error(404, 'API client not found');
  }

  if (!userHasFullAccessToOrganizationId(userId, app.organizationId)) {
    throw new Meteor.Error(402, 'Not authorized');
  }

  return app;
}

Meteor.methods({
  deleteAppWithId(appId) {
    check(appId, String);
    getAppAndEnsureAccess(this.userId, appId);
    Apps.remove({ _id: appId });
  },
  // This function re-inserts the app MongoDB document with a new _id representing its hostname.
  setAccessibilityAppHostname(previousAppId, hostname) {
    check(previousAppId, String);
    check(hostname, String);
    const app = getAppAndEnsureAccess(this.userId, previousAppId);
    const clientSideConfiguration = {};
    Apps.insert({ clientSideConfiguration, ...app, _id: hostname }, (error) => {
      if (error) {
        throw error;
      }
      Apps.remove(previousAppId);
    });
  },
});
