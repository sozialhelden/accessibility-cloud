import getDefaultTranslationStrategy from '../../../../server/i18n-new/getDefaultTranslationStrategy';
import makeCollectionTranslatable from '../../../../server/i18n-new/makeCollectionTranslatable';
import { AppLinks } from '../app-links';

const translatablePropertyNames = [
  'label',
  'url',
];

const collection = AppLinks;
makeCollectionTranslatable({ collection, translationStrategy: getDefaultTranslationStrategy({ collection, translatablePropertyNames })})