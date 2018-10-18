import { get } from 'lodash';
import { resourceSlugForCollection } from './resource-slug';
import { getLocales } from './locales';
import { MsgidFn } from '../../server/i18n/types';

// const resourceSlug = resourceSlugForCollection(collection);
// getTranslationFn(locale, doc) {
//   return get(doc, attributePathFn(locale));
// },

function findLocaleWithCountry(resourceSlug, localeWithoutCountry) {
  const regexp = new RegExp(`^${localeWithoutCountry}_`);
  const locales = getLocales(resourceSlug);
  const result = locales.find(locale => locale.match(regexp));
  return result;
}


type Options = {
  resourceSlug: string,
  defaultLocale: string,
  attributeName: string,
  requestedLocale: string,
  doc: object,
  msgidFn: MsgidFn,
  getTranslationFn?: (doc: object, locale: string) => string,
};


export default function translate({
  resourceSlug,
  defaultLocale,
  getTranslationFn = (locale, doc) => get(doc, attributePathFn(locale)),
  requestedLocale,
  msgidFn,
  attributeName,
  doc,
}: Options) {
  const sanitizedRequestedLocale = (requestedLocale || defaultLocale).replace('_', '-');
  const localeWithoutCountry = (requestedLocale || defaultLocale).substring(0, 2).toLowerCase();
  const localeHasCountry = sanitizedRequestedLocale !== localeWithoutCountry;
  const localeWithDefaultCountry = localeHasCountry ? sanitizedRequestedLocale :
    findLocaleWithCountry(resourceSlug, sanitizedRequestedLocale);

  const localesToTry = [
    requestedLocale,
    sanitizedRequestedLocale,
    localeWithoutCountry,
    localeWithDefaultCountry,
    defaultLocale,
  ].filter(Boolean);

  for (const locale of localesToTry) {
    const translation = getTranslationFn(doc, locale);
    if (translation) {
      return translation;
    }
  }

  return msgidFn(attributeName)(doc); // return the untranslated attribute
}
