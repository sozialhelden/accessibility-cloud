import { cloneDeep, get } from 'lodash';
import { SetLocalTranslationOptions, GetLocalTranslationOptions, MsgidsToTranslationDescriptors } from '../../../../server/i18n-new/i18nTypes';
import { TranslationDescriptor } from '../../../../server/i18n-new/i18nTypes';
import { Apps } from '../apps';
import { defaultLocale } from '../../../../server/i18n-new/makeCollectionTranslatable';

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
});

const translationDescriptors: TranslationDescriptor[] = translatablePropertyNames
  .map(createTranslationDescriptor);


export function setLocalTranslation({ doc, locale, msgstr, translationDescriptor }: SetLocalTranslationOptions) {
  const attributePath = translationDescriptor.propertyPathFn(translationDescriptor.propertyName)(locale);
  const modifierOriginal = { $set: { [attributePath]: msgstr } };
  const modifier = cloneDeep(modifierOriginal);
  try {
    Apps.update(get(doc, '_id'), modifier);
  } catch (error) {
    console.error('Error while updating app', doc && get(doc, '_id'), 'with modifier', modifier, '- schema:', get(Apps, 'schema'));
    throw error;
  }
}


export function getLocalTranslation({ doc, locale, translationDescriptor }: GetLocalTranslationOptions) {
  const localizedStringPath = translationDescriptor.propertyPathFn(translationDescriptor.propertyName)(locale);
  const originalPath = translationDescriptor.propertyName;
  return get(doc, localizedStringPath);
}


export function getMsgidsToTranslationDescriptors(): MsgidsToTranslationDescriptors {
  const result: MsgidsToTranslationDescriptors = {};
  Apps.find().fetch()
    .forEach((doc: object) => {
      translationDescriptors.forEach(translationDescriptor => {
        const msgid = `${get(doc, '_id')} ${translationDescriptor.propertyName}`;
        if (!getLocalTranslation({ doc, locale: defaultLocale, translationDescriptor })) {
          return;
        }
        result[msgid] = { translationDescriptor, doc };
      });
    });
  return result;
}
