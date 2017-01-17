import { Meteor } from 'meteor/meteor';
import { Apps } from '/both/api/apps/apps';
import { Organizations } from '/both/api/organizations/organizations';

// Returns the app that is authenticated for the given token string, or undefined if the token
// is not valid / not found.

export function getAppFromToken(tokenString) {
  console.log(`Trying to find app for token '${tokenString}'…`);

  const app = Apps.findOne({ tokenString });
  if (!app) {
    return null;
  }

  if (!app.organizationId) {
    throw new Meteor.Error(401, `App ${app._id} has no organization set`);
  }

  const organization = Organizations.findOne(app.organizationId);
  if (!organization) {
    throw new Meteor.Error(401, `App ${app._id} has an invalid organization set.`);
  }

  return app;
}
