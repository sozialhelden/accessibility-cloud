import { _ } from 'meteor/stevezhu:lodash';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { resourceSlugForCollection } from './resource-slug';
import { getLocales } from './locales';

function findLocaleWithCountry(resourceSlug, localeWithoutCountry) {
  const regexp = new RegExp(`^${localeWithoutCountry}_`);
  const locales = getLocales(resourceSlug);
  const result = locales.find(locale => locale.match(regexp));
  return result;
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
    resourceSlug,
    defaultLocale,
    attributePathFn,
    msgidFn,
    getTranslationFn(locale, doc) {
      const localeWithoutCountry = locale.replace(/_[A-Z][A-Z]$/);
      const localeHasCountry = locale !== localeWithoutCountry;
      const localeWithDefaultCountry =
        localeHasCountry ? locale : findLocaleWithCountry(locale, doc);
      return _.get(doc, attributePathFn(locale)) ||
        _.get(doc, attributePathFn(localeWithoutCountry)) ||
        _.get(doc, attributePathFn(localeWithDefaultCountry)) ||
        _.get(doc, attributePathFn(defaultLocale)) ||
        null;
    },
  });

  collection.helpers({
    [helperName](locale) { return helper(locale, this); },
  });

  console.log(`Added \`${helperName}\` helper function on ${collection._name} documents.`);
}
