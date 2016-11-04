import { OrganizationMembers } from '../organization-members.js';
import { publishPublicFields } from '/server/publish';
import { publishPrivateFieldsForMembers } from '/both/api/organizations/server/publications';

publishPublicFields('organizationMembers', OrganizationMembers);

// Also publish private fields for members of the organizations you're a member of
publishPrivateFieldsForMembers('organizationMembers', OrganizationMembers);
