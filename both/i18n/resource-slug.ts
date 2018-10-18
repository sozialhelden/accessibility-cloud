import { dasherize } from 'inflection';
import { decapitalize } from '../lib/decapitalize';

export function resourceSlugForCollection(collection) {
  return dasherize(decapitalize(collection._name));
}
