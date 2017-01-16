import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/stevezhu:lodash';
import { acFormat } from '/both/lib/ac-format';
import { syncWithTransifex } from './sync';
import { TAPi18n } from 'meteor/tap:i18n';
import { isAdmin } from '/both/lib/is-admin';
import { cacheRegisteredLocales } from './locales';
import { createTranslationHelper } from './translation-helper';


const msgidsToDocs = {};


function lastPart(path) {
  return path.replace(/(.*)\./, '');
}


const resourceSlug = 'accessibility-attributes';

const translate = createTranslationHelper({
  resourceSlug,
  defaultLocale: 'en-US',
  getTranslationFn(locale, msgid) {
    return msgidsToDocs[msgid] && msgidsToDocs[msgid][locale];
  },
});

export function getTranslationForAccessibilityAttribute(path, locale) {
  const msgid = lastPart(path);
  return translate(locale, msgid);
}


function pathsInObjectWithRootPath(currentPath, object) {
  return _.flatten(_.map(object, (value, key) => {
    const path = currentPath ? `${currentPath || ''}.${key}` : key;
    return _.isObject(value) ? [path].concat(pathsInObjectWithRootPath(path, value)) : path;
  }));
}

export function pathsInObject(object) {
  return pathsInObjectWithRootPath(null, object);
}


function syncPropertyNamesWithTransifex() {
  // Remove all local translations first
  const keys = Object.keys(msgidsToDocs);
  keys.forEach(key => { delete msgidsToDocs[key]; });

  const paths = pathsInObject(acFormat);
  console.log('Paths', paths);
  paths.forEach(path => {
    const msgid = lastPart(path);
    msgidsToDocs[msgid] = {
      translator: path.replace(`.${msgid}`),
    };
  });

  return syncWithTransifex({
    msgidsToDocs,
    resourceSlug,
    getTranslationForDocFn(doc, locale) {
      return doc[locale];
    },
    updateLocalDocumentFn({ doc, locale, msgstr }) {
      doc[locale] = msgstr; // eslint-disable-line no-param-reassign
    },
  });
}


Meteor.startup(() => {
  syncPropertyNamesWithTransifex();
  cacheRegisteredLocales(resourceSlug);
});


Meteor.methods({
  'acFormat.syncWithTransifex'() {
    if (!this.userId) {
      throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, TAPi18n.__('You are not authorized to import categories.'));
    }
    return syncPropertyNamesWithTransifex();
  },
});
