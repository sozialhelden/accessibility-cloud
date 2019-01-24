import { Meteor } from 'meteor/meteor';
import { OrganizationMembers } from '../organization-members';
import addKeysToFastlyPurgingQueue from '../../../../server/cdn-purging/addKeysToFastlyPurgingQueue';


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
      addKeysToFastlyPurgingQueue([doc.userId]);
    },
    changed(newDoc, oldDoc) {
      if (newDoc.role !== oldDoc.role) {
        addKeysToFastlyPurgingQueue([newDoc.userId]);
      }
    },
    removed(oldDoc) {
      addKeysToFastlyPurgingQueue([oldDoc.userId]);
    },
  });

  isInitializing = false;
});
