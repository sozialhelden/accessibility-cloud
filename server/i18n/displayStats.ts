import {
  MsgidsToTranslationDescriptors,
  GetLocalTranslationFn,
  POFile,
} from './i18nTypes';

export default function displayStats({
  context,
  getLocalTranslation,
  locale,
  msgidsToTranslationDescriptors,
  poFile,
  resourceSlug,
}: {
  context: string;
  getLocalTranslation: GetLocalTranslationFn;
  locale: string;
  msgidsToTranslationDescriptors: MsgidsToTranslationDescriptors;
  resourceSlug: string;
  poFile: POFile;
}) {
  const remoteTranslations = poFile.translations[context] || {};
  console.log(
    'Syncing',
    resourceSlug,
    'translations for locale',
    locale,
    '...',
  );
  const remoteMsgids = Object.keys(remoteTranslations).filter(
    msgid => msgid !== '',
  );
  const remoteCount = remoteMsgids.length;
  const remoteEmptyCount = remoteMsgids.filter(
    msgid => !remoteTranslations[msgid].msgstr.filter(str => str.length).length,
  )
  .length;
  console.log(`${remoteCount} remote translations (${remoteEmptyCount} empty msgstrs)`);
  const localCount = Object.keys(msgidsToTranslationDescriptors).length;
  const localEmptyCount = Object.keys(msgidsToTranslationDescriptors)
    .map(msgid => msgidsToTranslationDescriptors[msgid])
    .filter(({ doc, propertyName }) =>
      !getLocalTranslation({ doc, propertyName, locale }),
    )
    .length;
  console.log(`${localCount} local translations (${localEmptyCount} empty msgstrs)`);
}
