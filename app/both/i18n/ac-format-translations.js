import { flatten, isObject, map } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { createTranslationHelper } from './translation-helper';
import { AccessibilityAttributes } from '../api/accessibility-attributes/accessibility-attributes';

export const msgidsToDocs = {};

export function lastPart(path) {
  return path.replace(/(.*)\./, '');
}

export const resourceSlug = 'accessibility-attributes';
export const defaultLocale = 'en-US';
export const translate = createTranslationHelper({
  resourceSlug,
  defaultLocale,
  getTranslationFn(locale, msgid) {
    return msgidsToDocs[msgid] && msgidsToDocs[msgid].label[locale];
  },
});

export function getTranslationForAccessibilityAttributeName(path, locale) {
  locale = (locale || defaultLocale).replace('-', '_');
  const msgid = lastPart(path);
  return translate(locale, msgid);
}


export function pathsInObjectWithRootPath(currentPath, object) {
  return flatten(map(object, (value, key) => {
    const path = currentPath ? `${currentPath || ''}.${key}` : key;
    return isObject(value) ? [path].concat(pathsInObjectWithRootPath(path, value)) : path;
  }));
}

export function pathsInObject(object) {
  return pathsInObjectWithRootPath(null, object);
}

export function fillAccessibilityAttributeLocaleCache() {
  const attributes = AccessibilityAttributes.find({}, { fields: { label: 1 }, transform: null });
  attributes.forEach((doc) => {
    msgidsToDocs[doc._id] = doc;
  });
}

Meteor.startup(() => {
  // prewarm cache
  fillAccessibilityAttributeLocaleCache();
});
