import { Meteor } from 'meteor/meteor';
import { OrganizationMembers } from '../organization-members';
import sendPurgeRequestToFastly from '../../../../server/cdn-purging/sendPurgeRequestToFastly';


// This purges personal API responses obtained via user-based API tokens from Fastly when
// a user membership changes.
Meteor.startup(() => {
  let isInitializing = true;

  OrganizationMembers.find().observe({
    added(doc) {
      if (isInitializing) {
        // without this, purging would happen for all documents on each server start.
        return;
      }
      sendPurgeRequestToFastly([doc.userId]);
    },
    changed(newDoc, oldDoc) {
      if (newDoc.role !== oldDoc.role) {
        sendPurgeRequestToFastly([newDoc.userId]);
      }
    },
    removed(oldDoc) {
      sendPurgeRequestToFastly([oldDoc.userId]);
    },
  });

  isInitializing = false;
});
