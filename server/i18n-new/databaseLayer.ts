import { cloneDeep, get } from 'lodash';
import { SetterOptions, GetterOptions } from './i18nTypes';

const databaseLayer = {
  setter({ doc, locale, msgstr, attributeDescriptor, collection }: SetterOptions) {
    const attributePath = attributeDescriptor.attributePathFn(attributeDescriptor.attributeName)(locale);
    const modifierOriginal = { $set: { [attributePath]: msgstr } };
    const modifier = cloneDeep(modifierOriginal);
    try {
      collection.update(get(doc, '_id'), modifier);
    } catch (error) {
      console.error(
        'Error while updating',
        (collection && collection._name),
        'document',
        doc && get(doc, '_id'),
        'with modifier',
        modifier,
        'original modifier:',
        modifierOriginal,
        'schema:',
        collection.schema,
      );
      throw error;
    }
  },
  getTranslatedString({ doc, locale, attributeDescriptor }: GetterOptions) {
    const localizedStringPath = attributeDescriptor.attributePathFn(attributeDescriptor.attributeName)(locale);
    const originalPath = attributeDescriptor.attributeName;
    return get(doc, localizedStringPath) || get(doc, originalPath);
  }
}


export default databaseLayer;