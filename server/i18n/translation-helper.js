import { _ } from 'meteor/stevezhu:lodash';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';

export function addTranslationHelper(
  { attributeName, attributePathFn, collection, defaultLocale, msgidFn }
) {
  check(attributeName, String);
  check(attributePathFn, Function);
  check(collection, Mongo.Collection);
  check(defaultLocale, String);
  check(msgidFn, Function);

  const helperName = `getLocalized${_.capitalize(attributeName.replace(/^_/, ''))}`;
  collection.helpers({
    [helperName](locale) {
      const translationInCorrectLocale = _.get(this, attributePathFn(locale));
      if (translationInCorrectLocale) { return translationInCorrectLocale; }
      const translationInDefaultLocale = _.get(this, attributePathFn(defaultLocale));
      if (translationInDefaultLocale) { return translationInDefaultLocale; }
      // return the untranslated attribute
      return msgidFn(this);
    },
  });

  console.log(`Added \`${helperName}\` helper function on ${collection._name} documents.`);
}
