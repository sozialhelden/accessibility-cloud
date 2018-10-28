import { humanize } from 'inflection';
import { cloneDeep, without, difference } from 'lodash';
import { AttributeDescriptor } from './i18nTypes';
import databaseLayer from './databaseLayer';
import { POFile } from './i18nTypes';


// - Write new translations from transifex into local docs
// - clone given PO file, remove translations from clone that are not in local docs anymore
// - return the modified PO file copy
export default function updateAndPruneUnusedStringsFromPOFile({ msgidsToDocs, context, poFile, collection, }: {
  msgidsToDocs: {
    [msgid: string]: {
      attributeDescriptor: AttributeDescriptor;
      doc: object;
    };
  };
  context: string;
  poFile: POFile;
  collection: any;
}) {
  const locale = poFile.headers.language;
  const newPOFile = cloneDeep(poFile);
  newPOFile.translations[context] = newPOFile.translations[context] || {};
  const newPOFileTranslations = newPOFile.translations[context];
  const msgids = Object.keys(msgidsToDocs);
  let updatedLocalStringsCount = 0;
  msgids.forEach(msgid => {
    const poFileTranslation = newPOFileTranslations[msgid];
    const { attributeDescriptor, doc } = msgidsToDocs[msgid];
    const existingTranslation = databaseLayer.getTranslatedString({ attributeDescriptor, doc, locale });
    if (poFileTranslation) {
      // overwrite existing local translation with data from PO file if necessary
      const msgstr = poFileTranslation.msgstr[0];
      if (msgstr && existingTranslation !== msgstr) {
        console.log(`Updating local string ‘${msgstr}’...`);
        updatedLocalStringsCount++;
        databaseLayer.setter({ doc, locale, msgstr, attributeDescriptor, collection });
      }
    }
    else {
      // add existing local translation to PO file
      const isDefaultLocale = locale === 'en_US';
      newPOFileTranslations[msgid] = {
        msgid,
        msgstr: [existingTranslation || (isDefaultLocale ? humanize(msgid) : '')],
      };
    }
  });
  console.log(`Updated ${updatedLocalStringsCount} local strings.`);
  const translatedMsgids = Object.keys(newPOFileTranslations);
  const msgidsToDelete = without(difference(translatedMsgids, msgids), '');
  msgidsToDelete.forEach(msgid => {
    delete newPOFileTranslations[msgid];
  });
  console.log('Deleted msgids from synced PO file:', msgidsToDelete);
  return newPOFile;
}