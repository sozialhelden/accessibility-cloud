import { Licenses } from '../licenses.js';
import { publishPublicFields } from '/server/publish';
import { publishPrivateFieldsForMembers } from '/both/api/organizations/server/publications';

publishPublicFields('licenses', Licenses);
publishPrivateFieldsForMembers('licenses', Licenses);
