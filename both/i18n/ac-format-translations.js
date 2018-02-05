import { _ } from 'meteor/stevezhu:lodash';
import { createTranslationHelper } from './translation-helper';

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
    return msgidsToDocs[msgid] && msgidsToDocs[msgid][locale];
  },
});

export function getTranslationForAccessibilityAttributeName(path, locale) {
  locale = (locale || defaultLocale).replace('-', '_');
  const msgid = lastPart(path);
  return translate(locale, msgid);
}


export function pathsInObjectWithRootPath(currentPath, object) {
  return _.flatten(_.map(object, (value, key) => {
    const path = currentPath ? `${currentPath || ''}.${key}` : key;
    return _.isObject(value) ? [path].concat(pathsInObjectWithRootPath(path, value)) : path;
  }));
}

export function pathsInObject(object) {
  return pathsInObjectWithRootPath(null, object);
}
