import getDefaultTranslationStrategy from '../../../../server/i18n/getDefaultTranslationStrategy';
import makeCollectionTranslatable from '../../../../server/i18n/makeCollectionTranslatable';
import { Apps } from '../apps';

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

const collection = Apps;
makeCollectionTranslatable({ collection, translationStrategy: getDefaultTranslationStrategy({ collection, translatablePropertyNames })})