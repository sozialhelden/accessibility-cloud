import { get } from 'lodash';
import { Apps } from '../apps';
import makeCollectionTranslatable from '../../../../server/i18n-new/makeCollectionTranslatable';
import { AttributeDescriptor } from '../../../../server/i18n-new/i18nTypes';

const translatablePropertyNames = [
  'clientSideConfiguration.textContent.product.name',
  'clientSideConfiguration.textContent.product.claim',
  'clientSideConfiguration.textContent.product.description',
  'clientSideConfiguration.textContent.onboarding.headerMarkdown',
  'clientSideConfiguration.textContent.accessibilityNames.long.unknown',
  'clientSideConfiguration.textContent.accessibilityNames.long.yes',
  'clientSideConfiguration.textContent.accessibilityNames.long.limited',
  'clientSideConfiguration.textContent.accessibilityNames.long.no',
  'clientSideConfiguration.textContent.accessibilityNames.short.unknown',
  'clientSideConfiguration.textContent.accessibilityNames.short.yes',
  'clientSideConfiguration.textContent.accessibilityNames.short.limited',
  'clientSideConfiguration.textContent.accessibilityNames.short.no',
];

const createAttributeDescriptor = (name) => ({
  attributeName: name,
  attributePathFn: () => () => name,
  msgidFn: () => (doc) => `${get(doc, '_id')}.${name}`,
});

const attributeDescriptors: AttributeDescriptor[] = translatablePropertyNames
  .map(createAttributeDescriptor);

makeCollectionTranslatable(Apps, attributeDescriptors);
