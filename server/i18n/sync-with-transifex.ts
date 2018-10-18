// @flow
import Fiber from 'fibers';
import { get } from 'lodash';
import { Meteor } from 'meteor/meteor';

import { acFormat } from '../../both/lib/ac-format';
import { isAdmin } from '../../both/lib/is-admin';
import { msgidsToDocs, pathsInObject, resourceSlug, lastPart } from '../../both/i18n/ac-format-translations';
import { syncWithTransifex } from './sync';
import { cacheRegisteredLocales } from '../../both/i18n/locales';

function syncPropertyNamesWithTransifex() {
  // Remove all local translations first
  const keys = Object.keys(msgidsToDocs);
  keys.forEach(key => delete msgidsToDocs[key]);

  const paths = pathsInObject(acFormat);
  // console.log('Paths', paths);
  paths.forEach((path) => {
    const msgid = lastPart(path);
    msgidsToDocs[msgid] = { translator: path.replace(`.${msgid}`) };
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
  Fiber(() => cacheRegisteredLocales(resourceSlug)).run();
  if (get(Meteor.settings, 'transifex.skipSyncingOnStart')) {
    console.log('Skipping automatic transifex syncing on server start.');
    return;
  }
  Fiber(() => syncPropertyNamesWithTransifex()).run();
});


Meteor.methods({
  'acFormat.syncWithTransifex'() {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'You are not authorized to import categories.');
    }
    return syncPropertyNamesWithTransifex();
  },
});
