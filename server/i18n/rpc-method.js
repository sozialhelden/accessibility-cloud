import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { TAPi18n } from 'meteor/tap:i18n';
import { isAdmin } from '/both/lib/is-admin';
import { syncWithTransifex } from './sync';
import { resourceSlugForCollection } from './resource-slug';


function syncCollectionWithTransifex({ attributePathFn, collection, defaultLocale, msgidFn }) {
  const resourceSlug = resourceSlugForCollection(collection);

  const getTranslationForDocFn = (doc, locale) => doc.translations[locale];
  const updateLocalDocumentFn = ({ doc, locale, msgstr }) => {
    collection.update(doc._id, { $set: { [attributePathFn(locale)]: msgstr } });
  };

  const msgidsToDocs = {};
  collection.find().fetch().filter(doc => doc.translations)
    .forEach(doc => {
      const msgid = msgidFn(doc);
      msgidsToDocs[msgid] = doc;
    });

  syncWithTransifex({
    defaultLocale, msgidsToDocs, resourceSlug, updateLocalDocumentFn, getTranslationForDocFn,
  });
}


export function addRPCMethodForSyncing(
  { attributePathFn, collection, defaultLocale, msgidFn }
) {
  check(attributePathFn, Function);
  check(collection, Mongo.Collection);
  check(defaultLocale, String);
  check(msgidFn, Function);

  const methodName = `${collection._name}.syncWithTransifex`;

  Meteor.methods({
    [methodName]() {
      if (!this.userId) {
        throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
      }
      if (!isAdmin(this.userId)) {
        throw new Meteor.Error(403, TAPi18n.__('You are not authorized to import categories.'));
      }
      return syncCollectionWithTransifex(
        { collection, attributePathFn, msgidFn, defaultLocale }
      );
    },
  });

  console.log(`Registered \`${methodName}\` method.`);
}
