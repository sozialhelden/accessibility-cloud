import { check } from 'meteor/check';
import { cloneDeep, values } from 'lodash';
import { POFile } from './i18nTypes';


// Copies a given PO file and replace all translated strings with empty strings.
// This is necessary to create a POT translation template as translation source on transifex.
export default function stripTranslations(poFile: POFile, context: string = '') {
  check(context, String);
  check(poFile, Object);
  const newPOFile = cloneDeep(poFile);
  values(newPOFile.translations[context]).forEach(translation => {
    translation.msgstr = ['']; // eslint-disable-line no-param-reassign
  });
  return newPOFile;
}