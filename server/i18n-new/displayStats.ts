import { AttributeDescriptor, MsgidsToDocs } from './i18nTypes';
import databaseLayer from './databaseLayer';
import { POFile } from './i18nTypes';
import { inspect } from 'util';

export default function displayStats({ poFile, msgidsToDocs, context, resourceSlug, locale }: {
  poFile: POFile;
  msgidsToDocs: MsgidsToDocs,
  context: string;
  resourceSlug: string;
  locale: string;
}) {
  const remoteTranslations = poFile.translations[context] || {};
  console.log('Syncing', resourceSlug, 'translations for locale', locale, '...');
  const remoteMsgids = Object.keys(remoteTranslations).filter(msgid => msgid !== '');
  const remoteCount = remoteMsgids.length;
  const remoteEmptyCount = remoteMsgids
    .filter(msgid => !remoteTranslations[msgid].msgstr.filter(str => str.length).length)
    .length;
  console.log(`${remoteCount} remote translations (${remoteEmptyCount} missing)`);
  const localCount = Object.keys(msgidsToDocs).length;
  console.log(`${localCount} local translations`);
  const localEmptyCount = Object.keys(msgidsToDocs)
    .map(msgid => msgidsToDocs[msgid])
    // .map(x => {
    //   Meteor._debug(x);
    //   return x;
    // })
    .map(({ doc, attributeDescriptor }) => databaseLayer.getTranslatedString({ doc, attributeDescriptor, locale }))
    .filter(translation => !translation)
    .length;
  console.log(`(${localEmptyCount} missing)`);
}