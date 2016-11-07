import { SourceImports } from '../source-imports.js';
import { publishPublicFields } from '/server/publish';
import { publishPrivateFieldsForMembers } from '/both/api/organizations/server/publications';

publishPublicFields('sourceImports', SourceImports);
publishPrivateFieldsForMembers('sourceImports', SourceImports);
