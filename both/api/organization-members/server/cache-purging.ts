import { Meteor } from 'meteor/meteor';
import { OrganizationMembers } from '../organization-members';
import addKeysToFastlyPurgingQueue from
  '../../../../server/cdn-purging/addKeysToFastlyPurgingQueue';

type OrganizationMember = {
  role?: string,
  userId?: string,
};

// This purges personal API responses obtained via user-based API tokens from Fastly when
// a user membership changes.
Meteor.startup(() => {
  let isInitializing = true;

  OrganizationMembers.find().observe({
    added(doc: OrganizationMember) {
      if (isInitializing) {
        // without this, purging would happen for all documents on each server start.
        return;
      }
      addKeysToFastlyPurgingQueue([doc.userId]);
    },
    changed(newDoc: OrganizationMember, oldDoc: OrganizationMember) {
      if (newDoc.role !== oldDoc.role && newDoc.userId) {
        addKeysToFastlyPurgingQueue([newDoc.userId]);
      }
    },
    removed(oldDoc: OrganizationMember) {
      if (oldDoc.userId) {
        addKeysToFastlyPurgingQueue([oldDoc.userId]);
      }
    },
  });

  isInitializing = false;
});
