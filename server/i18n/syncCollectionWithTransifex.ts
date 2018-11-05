import { registerLocale, cacheRegisteredLocales } from '../../both/i18n/locales';
import { TranslationDescriptor, MsgidsToTranslationDescriptors, GetLocalTranslationFn, SetLocalTranslationFn, TranslationStrategy } from './i18nTypes';
import displayStats from "./displayStats";
import exportToTransifex from "./exportToTransifex";
import importFromTransifex from './importFromTransifex';
import generateEmptyPoFile from "./generateEmptyPoFile";
import getSupportedLocales from "./getSupportedLocales";
import resourceSlugForCollection from './resourceSlugForCollection';
import returnNullIfFunctionThrows404 from "./returnNullIfFunctionThrows404";
import stripTranslations from "./stripTranslations";
import updateAndPruneUnusedStringsFromPOFile from "./updateAndPruneUnusedStringsFromPOFile";


// Imports strings from transifex, writes new translations into the given documents and removes
// strings from the translation template that are not in the DB anymore (they stay in translation
// memory on transifex). Strings from given documents that are not found in transifex yet are
// uploaded to transifex to be translated.
export default function syncCollectionWithTransifex({
  // PO files support the same msgid key string to appear in different contexts.
  context = '',
  // language of the source strings to be translated
  defaultLocale = 'en_US',
  // slug name of the transifex resource that should be used for syncing
  resourceSlug,
  translationStrategy,
}: {
    context?: string;
    defaultLocale?: string;
    translationStrategy: TranslationStrategy,
    resourceSlug: string,
  }) {
  const msgidsToTranslationDescriptors = translationStrategy.getMsgidsToTranslationDescriptors();
  const { getLocalTranslation, setLocalTranslation } = translationStrategy;
  console.log('Starting transifex synchronization for', resourceSlug, `(Context: '${context}')`);
  console.log('msgids to translate:', Object.keys(msgidsToTranslationDescriptors));

  try {
    getSupportedLocales(resourceSlug, defaultLocale).forEach(locale => {
      registerLocale(resourceSlug, locale);
      const remotePoFile = returnNullIfFunctionThrows404(importFromTransifex)(resourceSlug, locale);
      if (!remotePoFile) {
        console.log('Remote language', locale, 'not existing yet.');
      }
      const poFile = remotePoFile || generateEmptyPoFile(locale);
      displayStats({ resourceSlug, locale, poFile, msgidsToTranslationDescriptors, context, getLocalTranslation });
      const mergedTranslations = updateAndPruneUnusedStringsFromPOFile({
        context,
        getLocalTranslation,
        msgidsToTranslationDescriptors,
        poFile,
        setLocalTranslation,
      });
      if (locale === defaultLocale) {
        console.log('Syncing PO file for', locale, 'language...');
        // Source files can't have translations on transifex, so strip them.
        exportToTransifex({
          resourceSlug,
          asSourceFile: true,
          isNewResource: !remotePoFile,
          poFile: stripTranslations(mergedTranslations),
        });
      }
      exportToTransifex({
        resourceSlug,
        asSourceFile: false,
        isNewResource: false,
        poFile: mergedTranslations,
      });
    });
    cacheRegisteredLocales(resourceSlug);
  }
  catch (error) {
    console.error('Error while syncing with transifex:', error, error.stack);
    return false;
  }
  return true;
}