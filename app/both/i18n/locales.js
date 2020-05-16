import { Mongo } from 'meteor/mongo';

const AvailableLocales = new Mongo.Collection('AvailableLocales');
const cachedSlugsToLocales = {};

export function getLocales(resourceSlug) {
  return cachedSlugsToLocales[resourceSlug] ||
    AvailableLocales.find({ resourceSlug }).fetch().map(doc => doc.locale).sort();
}

export function registerLocale(resourceSlug, locale) {
  AvailableLocales.upsert({ resourceSlug, locale }, { resourceSlug, locale });
  console.log('Registered locale', locale, 'for', resourceSlug, '.');
}

export function cacheRegisteredLocales(resourceSlug) {
  cachedSlugsToLocales[resourceSlug] = getLocales(resourceSlug);
  console.log('Cached available locales', JSON.stringify(cachedSlugsToLocales[resourceSlug]), 'for', resourceSlug);
}
