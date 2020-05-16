import { humanize } from 'inflection';
import { cloneDeep, without, difference } from 'lodash';
import {
  GetLocalTranslationFn,
  SetLocalTranslationFn,
  MsgidsToTranslationDescriptors,
  POFile,
} from './i18nTypes';

// - Pull new translations from transifex into local docs
// - clone given PO file, remove translations from clone that are not in local docs anymore
// - return the modified PO file copy for pushing
export default function updateAndPruneUnusedStringsFromPOFile({
  context,
  getLocalTranslation,
  locale,
  msgidsToTranslationDescriptors,
  poFile,
  setLocalTranslation,
}: {
  context: string;
  getLocalTranslation: GetLocalTranslationFn;
  locale: string,
  msgidsToTranslationDescriptors: MsgidsToTranslationDescriptors;
  poFile: POFile;
  setLocalTranslation: SetLocalTranslationFn;
}) {
  console.log('Pulling new translations into local docs, merging, pruning...');
  const newPOFile = cloneDeep(poFile);
  newPOFile.translations[context] = newPOFile.translations[context] || {};
  const newPOFileTranslations = newPOFile.translations[context];
  const msgids = Object.keys(msgidsToTranslationDescriptors);
  let updatedLocalStringsCount = 0;
  let updatedRemoteStringsCount = 0;
  msgids.forEach((msgid) => {
    const poFileTranslation = newPOFileTranslations[msgid];
    const { propertyName, doc } = msgidsToTranslationDescriptors[msgid];
    const localMsgstr = getLocalTranslation({
      doc,
      propertyName,
      locale,
    });
    if (locale !== 'en' && poFileTranslation && poFileTranslation.msgstr.filter(str => str.length).length) {
      // overwrite existing local translation with data from PO file if necessary
      const msgstr = poFileTranslation.msgstr[0];
      if (msgstr && localMsgstr !== msgstr) {
        console.log(`Local string ‘${localMsgstr}’ is different from remote string ‘${poFileTranslation.msgstr}’...`);
        updatedLocalStringsCount += 1;
        setLocalTranslation({ doc, locale, msgstr, propertyName });
      }
    } else if (localMsgstr) {
      // add existing local translation to PO file
      updatedRemoteStringsCount += 1;
      newPOFileTranslations[msgid] = {
        msgid,
        msgstr: [localMsgstr || ''],
      };
    }
  });

  if (updatedLocalStringsCount) {
    console.log(`Updated ${updatedLocalStringsCount} local strings`);
  }
  if (updatedRemoteStringsCount) {
    console.log(`About to push ${updatedRemoteStringsCount} new remote strings.`);
  }
  const translatedMsgids = Object.keys(newPOFileTranslations);
  const msgidsToDelete = without(difference(translatedMsgids, msgids), '');
  msgidsToDelete.forEach((msgid) => {
    delete newPOFileTranslations[msgid];
  });
  console.log('Deleted msgids from synced PO file:', msgidsToDelete);
  return newPOFile;
}
