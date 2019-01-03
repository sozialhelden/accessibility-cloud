import { cloneDeep, get } from 'lodash';
import {
  GetLocalTranslationOptions,
  MsgidsToTranslationDescriptors,
  SetLocalTranslationOptions,
  TranslationStrategy,
} from './i18nTypes';
import { defaultLocale } from './makeCollectionTranslatable';

export const propertyPathFn = (name: string, locale: string) =>
  `${name}.${locale}`;

// This creates functions that access strings from a local MongoDB collection for
// syncing translations with transifex.

export default function getDefaultTranslationStrategy({
  collection,
  translatablePropertyNames,
}: {
  collection: any;
  translatablePropertyNames: string[];
}): TranslationStrategy {
  const setLocalTranslation = ({
    doc,
    locale,
    msgstr,
    propertyName,
  }: SetLocalTranslationOptions) => {
    console.log('Setting local translation', { locale, msgstr, propertyName });
    const attributePath = propertyPathFn(propertyName, locale);
    const modifierOriginal = { $set: { [attributePath]: msgstr } };
    const modifier = cloneDeep(modifierOriginal);
    try {
      collection.update(get(doc, '_id'), modifier);
    } catch (error) {
      console.error(
        'Error while updating app',
        doc && get(doc, '_id'),
        'with modifier',
        modifier,
        'original modifier:',
        modifierOriginal,
        '- schema:',
        get(collection, 'schema'),
      );
      throw error;
    }
  };

  const getLocalTranslation = ({
    doc,
    locale,
    propertyName,
  }: GetLocalTranslationOptions) => {
    const path = propertyPathFn(propertyName, locale);
    const result = get(doc, path);
    return result;
  };

  const getMsgidsToTranslationDescriptors = (): MsgidsToTranslationDescriptors => {
    const result: MsgidsToTranslationDescriptors = {};
    collection
      .find()
      .fetch()
      .forEach((doc: object) => {
        translatablePropertyNames.forEach((propertyName) => {
          const msgid = `${get(doc, '_id')} ${propertyName}`;
          const localTranslation = getLocalTranslation({
            doc,
            propertyName,
            locale: defaultLocale,
          });
          // if (!localTranslation) {
          //   return;
          // }
          result[msgid] = { propertyName, doc };
        });
      });
    return result;
  };

  return {
    getLocalTranslation,
    getMsgidsToTranslationDescriptors,
    setLocalTranslation,
  };
}
