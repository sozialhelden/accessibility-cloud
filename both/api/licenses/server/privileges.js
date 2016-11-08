import { isAdmin } from '/both/lib/is-admin';
import { userHasFullAccessToReferencedOrganization } from '/both/api/organizations/privileges';
import { Licenses } from '../licenses';

Licenses.allow({
  insert: userHasFullAccessToReferencedOrganization,
  update: userHasFullAccessToReferencedOrganization,
  remove: userHasFullAccessToReferencedOrganization,
});

Licenses.publicFields = {
  name: 1,
  organizationId: 1,
  shortName: 1,
  websiteURL: 1,
  fullTextURL: 1,
  plainTextSummary: 1,
  consideredAs: 1,
};

Licenses.helpers({
  editableBy: isAdmin,
});

Licenses.visibleSelectorForUserId = () => ({});
