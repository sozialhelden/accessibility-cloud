import { get } from 'lodash';
import { makeCollectionTranslatable } from '../../../../server/i18n/translatable-collection';
import { Apps } from '../apps';

const translatablePropertyNames = [
  'textContent.product.name',
  'textContent.product.claim',
  'textContent.product.description',
  'textContent.onboarding.headerMarkdown',
  'textContent.accessibilityNames.long.unknown',
  'textContent.accessibilityNames.long.yes',
  'textContent.accessibilityNames.long.limited',
  'textContent.accessibilityNames.long.no',
  'textContent.accessibilityNames.short.unknown',
  'textContent.accessibilityNames.short.yes',
  'textContent.accessibilityNames.short.limited',
  'textContent.accessibilityNames.short.no',
];

translatablePropertyNames.forEach(name => makeCollectionTranslatable(Apps, [{
  attributeName: name,
  attributePathFn: () => () => name,
  msgidFn: () => (doc) => `${get(doc, '_id')}.${name}`,
}]));
