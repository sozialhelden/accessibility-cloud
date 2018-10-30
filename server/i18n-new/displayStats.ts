import { TranslationDescriptor, MsgidsToTranslationDescriptors, GetLocalTranslationFn } from './i18nTypes';
import { POFile } from './i18nTypes';
import { inspect } from 'util';

export default function displayStats({
  context,
  getLocalTranslation,
  locale,
  msgidsToTranslationDescriptors,
  poFile,
  resourceSlug,
}: {
  context: string;
  getLocalTranslation: GetLocalTranslationFn,
  locale: string;
  msgidsToTranslationDescriptors: MsgidsToTranslationDescriptors,
  resourceSlug: string;
  poFile: POFile;
}) {
  const remoteTranslations = poFile.translations[context] || {};
  console.log('Syncing', resourceSlug, 'translations for locale', locale, '...');
  const remoteMsgids = Object.keys(remoteTranslations).filter(msgid => msgid !== '');
  const remoteCount = remoteMsgids.length;
  const remoteEmptyCount = remoteMsgids
    .filter(msgid => !remoteTranslations[msgid].msgstr.filter(str => str.length).length)
    .length;
  console.log(`${remoteCount} remote translations (${remoteEmptyCount} missing)`);
  const localCount = Object.keys(msgidsToTranslationDescriptors).length;
  console.log(`${localCount} local translations`);
  const localEmptyCount = Object.keys(msgidsToTranslationDescriptors)
    .map(msgid => msgidsToTranslationDescriptors[msgid])
    .map(({ doc, translationDescriptor }) => getLocalTranslation({ doc, translationDescriptor, locale }))
    .filter(translation => !translation)
    .length;
  console.log(`(${localEmptyCount} missing)`);
}