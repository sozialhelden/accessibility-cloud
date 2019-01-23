import OrganizationMembers from '../organization-members';
import purgeOnFastly from '../../../../server/purgeOnFastly';

// This purges personal API responses obtained via user-based API tokens from Fastly when
// a user membership changes.

OrganizationMembers.find().observe({
  added(_id, doc) {
    purgeOnFastly([doc.userId]);
  },
  changed(_id, newDoc, oldDoc) {
    if (newDoc.role !== oldDoc.role) {
      purgeOnFastly([newDoc.userId]);
    }
  },
  removed(oldDoc) {
    purgeOnFastly([oldDoc.userId]);
  },
});
