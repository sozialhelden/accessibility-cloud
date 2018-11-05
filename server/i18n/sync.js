import { check, Match } from 'meteor/check';
import { s } from 'meteor/underscorestring:underscore.string';
import {
  cloneDeep,
  difference,
  without,
  union,
} from 'lodash';
import { getLocales, importFromTransifex, exportToTransifex } from './transifex-api';
import { registerLocale, cacheRegisteredLocales } from '../../both/i18n/locales';

function generateEmptyPoFile(locale) {
  return {
    headers: {
      language: locale,
      'content-type': 'text/plain; charset=utf-8',
      'plural-forms': 'nplurals=2; plural=(n!=1);',
    },
    translations: {},
  };
}

// - Write new translations from transifex into local docs
// - clone given PO file, remove translations from clone that are not in local docs anymore
// - return the modified PO file copy

export function syncStringsWithPOFile({
  updateLocalDocumentFn, getTranslationForDocFn, msgidsToDocs, context, poFile,
}) {
  check(poFile, Object);
  check(context, String);
  check(updateLocalDocumentFn, Function);
  check(getTranslationForDocFn, Function);
  check(Object.keys(msgidsToDocs), [String]);
  check(Object.values(msgidsToDocs), [Match.Any]);

  const locale = poFile.headers.language;
  const newPOFile = cloneDeep(poFile);
  newPOFile.translations[context] = newPOFile.translations[context] || {};
  const poFileTranslations = newPOFile.translations[context];

  const msgids = Object.keys(msgidsToDocs);
  let updatedLocalStringsCount = 0;
  msgids.forEach((msgid) => {
    const poFileTranslation = poFileTranslations[msgid];
    const doc = msgidsToDocs[msgid];
    if (poFileTranslation) {
      // overwrite existing local translation with data from PO file if necessary
      const msgstr = poFileTranslation.msgstr[0];
      const existingTranslation = getTranslationForDocFn(doc, locale);
      if (msgstr && existingTranslation !== msgstr) {
        // console.log(`Updating local string ‘${msgstr}’...`);
        updatedLocalStringsCount += 1;
        updateLocalDocumentFn({ doc, locale, msgstr });
      }
    } else {
      // add existing local translation to PO file
      const isDefaultLocale = locale === 'en_US';
      let existingTranslation = getTranslationForDocFn(doc, locale);
      existingTranslation = existingTranslation || (isDefaultLocale ? s.humanize(msgid) : '');
      poFileTranslations[msgid] = {
        msgid,
        msgstr: [existingTranslation],
      };
    }
  });

  console.log(`Updated ${updatedLocalStringsCount} local strings.`);

  const translatedMsgids = Object.keys(poFileTranslations);
  const msgidsToDelete = without(difference(translatedMsgids, msgids), '');
  msgidsToDelete.forEach((msgid) => {
    delete poFileTranslations[msgid];
  });
  console.log('Deleted msgids from synced PO file:', msgidsToDelete);

  return newPOFile;
}


// Copies a given PO file and replace all translated strings with empty strings.
// This is necessary to create a POT translation template as translation source on transifex.

function stripTranslations(poFile, context = '') {
  check(context, String);
  check(poFile, Object);

  const newPOFile = cloneDeep(poFile);
  Object.values(newPOFile.translations[context]).forEach((translation) => {
    translation.msgstr = ['']; // eslint-disable-line no-param-reassign
  });
  return newPOFile;
}

function displayStats(
  { poFile, msgidsToDocs, context, resourceSlug, locale, getTranslationForDocFn },
) {
  const remoteTranslations = poFile.translations[context] || {};
  console.log('Syncing', resourceSlug, 'translations for locale', locale, '...');
  const remoteMsgids = Object.keys(remoteTranslations).filter(msgid => msgid !== '');
  const remoteCount = remoteMsgids.length;
  const remoteEmptyCount = remoteMsgids
    .filter(msgid => !remoteTranslations[msgid].msgstr.filter(str => str.length).length)
    .length;
  console.log(`${remoteCount} remote translations (${remoteEmptyCount} missing)`);
  const localCount = Object.keys(msgidsToDocs).length;
  const localEmptyCount = Object.values(msgidsToDocs)
    .map(doc => getTranslationForDocFn(doc, locale))
    .filter(translation => !translation)
    .length;
  console.log(`${localCount} local translations (${localEmptyCount} missing)`);
}

function returnNullIf404(fn) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      if (error.response && error.response.statusCode === 404) {
        return null;
      }
      throw error;
    }
  };
}

function getSupportedLocales(resourceSlug, defaultLocale) {
  const remoteLocales = returnNullIf404(getLocales)(resourceSlug) || [];
  if (!remoteLocales.length) {
    console.log('Resource not existing on transifex yet, no remote locales found.');
  }
  return union([defaultLocale], remoteLocales);
}

// Imports strings from transifex, writes new translations into the given documents and removes
// strings from the translation template that are not in the DB anymore (they stay in translation
// memory on transifex). Strings from given documents that are not found in transifex yet are
// uploaded to transifex to be translated.

export function syncWithTransifex({
  // PO files support the same msgid key string to appear in different contexts.
  context = '',
  // msgids / key strings to documents that contain the translations
  msgidsToDocs,
  // slug name of the transifex resource that should be used for syncing
  resourceSlug,
  // language of the source strings to be translated
  defaultLocale = 'en_US',
  // a function with ({ doc, locale, msgstr }) signature that updates the local document's
  // translations of the given locale with the given msgstr
  updateLocalDocumentFn,
  // A function with (doc, locale) signature that should just return the translated string of the
  // local document to be synced to transifex if not existing there
  getTranslationForDocFn,
}) {
  check(context, String);
  check(defaultLocale, String);
  check(updateLocalDocumentFn, Function);
  check(getTranslationForDocFn, Function);
  check(Object.keys(msgidsToDocs), [String]);
  check(Object.values(msgidsToDocs), [Match.Any]);

  console.log('Starting transifex synchronization for', resourceSlug, `(Context: '${context}')`);

  try {
    getSupportedLocales(resourceSlug, defaultLocale).forEach((locale) => {
      registerLocale(resourceSlug, locale);
      const remotePoFile = returnNullIf404(importFromTransifex)(resourceSlug, locale);
      if (!remotePoFile) {
        console.log('Remote language', locale, 'not existing yet.');
      }
      const poFile = remotePoFile || generateEmptyPoFile(locale);

      displayStats({ resourceSlug, locale, poFile, msgidsToDocs, context, getTranslationForDocFn });

      const mergedTranslations = syncStringsWithPOFile({
        poFile,
        context,
        msgidsToDocs,
        updateLocalDocumentFn,
        getTranslationForDocFn,
      });

      if (locale === defaultLocale) {
        console.log('Syncing PO file for', locale, 'language...');
        // Source files can't have translations on transifex, so strip them.
        exportToTransifex({
          resourceSlug,
          poFile: stripTranslations(mergedTranslations),
          asSourceFile: true,
          isNewResource: !remotePoFile,
        });
      }
      exportToTransifex({
        resourceSlug,
        poFile: mergedTranslations,
        asSourceFile: false,
        isNewResource: false,
      });
    });

    cacheRegisteredLocales(resourceSlug);
  } catch (error) {
    console.error('Error while syncing with transifex:', error, error.stack);
    return false;
  }
  return true;
}
