import { s } from 'meteor/underscorestring:underscore.string';

export default function resourceSlugForCollection(collection) {
  // eslint-disable-next-line no-underscore-dangle
  return s.dasherize(s.decapitalize(collection._name));
}
