import { cloneDeep, get } from 'lodash';
import { SetLocalTranslationOptions, GetLocalTranslationOptions } from './i18nTypes';

const localTranslationAccessors = {
  setLocalTranslation({ doc, locale, msgstr, translationDescriptor, collection }: SetLocalTranslationOptions) {
    const attributePath = translationDescriptor.propertyPathFn(translationDescriptor.propertyName)(locale);
    const modifierOriginal = { $set: { [attributePath]: msgstr } };
    const modifier = cloneDeep(modifierOriginal);
    try {
      collection.update(get(doc, '_id'), modifier);
    } catch (error) {
      console.error('Error while updating', (collection && collection._name), 'document',
        doc && get(doc, '_id'), 'with modifier', modifier, '- schema:', collection.schema,
      );
      throw error;
    }
  },
  getLocalTranslation({ doc, locale, translationDescriptor }: GetLocalTranslationOptions) {
    const localizedStringPath = translationDescriptor.propertyPathFn(translationDescriptor.propertyName)(locale);
    const originalPath = translationDescriptor.propertyName;
    return get(doc, localizedStringPath) || get(doc, originalPath);
  }
}


export default localTranslationAccessors;