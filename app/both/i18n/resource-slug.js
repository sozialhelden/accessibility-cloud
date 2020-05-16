import { s } from 'meteor/underscorestring:underscore.string';

export function resourceSlugForCollection(collection) {
  return s.dasherize(s.decapitalize(collection._name));
}
