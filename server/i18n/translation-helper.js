import { _ } from 'meteor/stevezhu:lodash';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { resourceSlugForCollection } from './resource-slug';
import { getLocales } from './locales';

function findLocaleWithCountry(resourceSlug, localeWithoutCountry) {
  const regexp = new RegExp(`^${localeWithoutCountry}_`);
  const locales = getLocales(resourceSlug);
  console.log('Trying', resourceSlug, locales, localeWithoutCountry);
  return locales.find(locale => locale.match(regexp));
}

export function createTranslationHelper(
  { resourceSlug, defaultLocale, getTranslationFn, msgidFn = (d) => d }
) {
  return (requestedLocale, docOrMsgId) => {
    const localeWithoutCountry = requestedLocale.replace(/_[A-Z][A-Z]$/);
    const localeHasCountry = requestedLocale !== localeWithoutCountry;
    const localeWithDefaultCountry = localeHasCountry ? requestedLocale :
      findLocaleWithCountry(resourceSlug, requestedLocale);

    const localesToTry = [
      requestedLocale,
      localeWithoutCountry,
      localeWithDefaultCountry,
      defaultLocale,
    ];

    for (const locale of localesToTry) {
      const translation = getTranslationFn(locale, docOrMsgId);
      if (translation) {
        return translation;
      }
    }

    return msgidFn(docOrMsgId); // return the untranslated attribute
  };
}

export function addTranslationHelper(
  { attributeName, attributePathFn, collection, defaultLocale, msgidFn }
) {
  check(attributeName, String);
  check(attributePathFn, Function);
  check(collection, Mongo.Collection);
  check(defaultLocale, String);
  check(msgidFn, Function);

  const resourceSlug = resourceSlugForCollection(collection);

  const helperName = `getLocalized${_.capitalize(attributeName.replace(/^_/, ''))}`;
  const helper = createTranslationHelper({
    resourceSlug, defaultLocale, attributePathFn, msgidFn,
    getTranslationFn: (locale, doc) => _.get(doc, attributePathFn(locale)),
  });
  collection.helpers({
    [helperName]: locale => helper(locale, this),
  });

  console.log(`Added \`${helperName}\` helper function on ${collection._name} documents.`);
}
