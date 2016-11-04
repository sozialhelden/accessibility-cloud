import { Sources } from '../sources.js';
import { publishPublicFields } from '/server/publish';
import { publishPrivateFieldsForMembers } from '/both/api/organizations/server/publications';

publishPublicFields('sources', Sources);
publishPrivateFieldsForMembers('sources', Sources);
