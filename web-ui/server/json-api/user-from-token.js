import { Meteor } from 'meteor/meteor';
import { Apps } from '/both/api/apps/apps';
import { OrganizationMembers } from '/both/api/organization-members/organization-members';
import { displayedUserName } from './displayed-user-name';

// Returns the user that is authenticated for the given token string, or undefined if the token
// is not valid / not found. The user is given as Meteor.users() document.

// Valid tokens are:
// - Meteor login tokens from a running session
// - App tokens. Currently, with an app token, you can authenticate as the first developer
//   or manager user account that is associated with the app's organization. This later has to
//   be changed so each organization member has their own token, as authenticating as a user
//   could give you access to their private data. We assume organization members currently trust
//   each other. App tokens are stored in an Apps MongoDB collection document.

export function userFromToken(tokenString) {
  console.log('Trying to find user for token', tokenString, '…');

  let user = Meteor.users.findOne({ 'services.resume.loginTokens.token': tokenString });

  if (!user) {
    const app = Apps.findOne({ tokenString });
    if (!app) {
      throw new Meteor.Error(401, 'Could not find app for given token.');
    }
    if (!app.organizationId) {
      throw new Meteor.Error(401, `App ${app._id} has no organization set`);
    }

    const membership = OrganizationMembers.findOne({
      organizationId: app.organizationId,
      $or: [{ role: 'developer' }, { role: 'manager' }],
    });
    if (!membership) {
      throw new Meteor.Error(
        401, `Could not find a user in organization ${app.organizationId}`
      );
    }

    user = Meteor.users.findOne(membership.userId);
    if (!user) {
      throw new Meteor.Error(401, `User ${membership.userId} does not exist.`);
    }
  }

  console.log(
    'Found user',
    displayedUserName(user)
  );

  return user;
}
