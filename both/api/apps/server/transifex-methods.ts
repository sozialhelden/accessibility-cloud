import { get } from 'lodash';
import { Apps } from '../apps';
import makeCollectionTranslatable, { defaultLocale } from '../../../../server/i18n-new/makeCollectionTranslatable';
import { TranslationDescriptor } from '../../../../server/i18n-new/i18nTypes';

const translatablePropertyNames = [
  'product.name',
  'product.claim',
  'product.description',
  'onboarding.headerMarkdown',
  'accessibilityNames.long.unknown',
  'accessibilityNames.long.yes',
  'accessibilityNames.long.limited',
  'accessibilityNames.long.no',
  'accessibilityNames.short.unknown',
  'accessibilityNames.short.yes',
  'accessibilityNames.short.limited',
  'accessibilityNames.short.no',
];

const createTranslationDescriptor = (name) => ({
  propertyName: name,
  propertyPathFn: () => (locale) => `clientSideConfiguration.textContent.${name}.${locale}`,
  msgidFn: () => (doc) => `${get(doc, '_id')} ${name}`,
});

const translationDescriptors: TranslationDescriptor[] = translatablePropertyNames
  .map(createTranslationDescriptor);

makeCollectionTranslatable(Apps, translationDescriptors);
