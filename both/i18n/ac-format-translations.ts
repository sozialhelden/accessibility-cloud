import { flatten, map, isObject } from 'lodash';
import translate from './translate';

export const msgidsToDocs = {};


export function lastPathPart(path) {
  return path.replace(/(.*)\./, '');
}


export const resourceSlug = 'accessibility-attributes';
export const defaultLocale = 'en-US';


const getTranslationFn = (locale, msgid) => {
  return msgidsToDocs[msgid] && msgidsToDocs[msgid][locale];
};


export function getTranslationForAccessibilityAttributeName(attributeName, locale) {
  const requestedLocale = (locale || defaultLocale).replace('-', '_');
  const msgidFn = () => lastPathPart(attributeName);
  return translate({ attributeName, resourceSlug, defaultLocale, getTranslationFn, requestedLocale, msgidFn, doc: {} });
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
