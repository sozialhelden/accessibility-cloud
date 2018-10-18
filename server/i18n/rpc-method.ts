import { cloneDeep } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { isAdmin } from '../../both/lib/is-admin';
import { syncWithTransifex, UpdateLocalDocumentFnOptions } from './sync';
import { resourceSlugForCollection } from '../../both/i18n/resource-slug';
import { AttributeDescriptor } from './types';

function syncCollectionWithTransifex({
  attributeDescriptor,
  collection,
  defaultLocale,
}: {
  attributeDescriptor: AttributeDescriptor,
  collection: any,
  defaultLocale: string,
}) {
  const attributePathFn = attributeDescriptor.attributePathFn(attributeDescriptor.attributeName);
  const msgidFn = attributeDescriptor.msgidFn(attributeDescriptor.attributeName);
  const resourceSlug = resourceSlugForCollection(collection);
  const getTranslationForDocFn = (doc, locale) => doc.translations[locale];
  const updateLocalDocumentFn = ({ doc, locale, msgstr }: UpdateLocalDocumentFnOptions) => {
    const modifierOriginal = { $set: { [attributePathFn(locale)]: msgstr } };
    const modifier = cloneDeep(modifierOriginal);
    try {
      collection.update(doc._id, modifier);
    } catch (error) {
      console.error(
        'Error while updating',
        (collection && collection._name),
        'document',
        doc && doc._id,
        'with modifier',
        modifier,
        'original modifier:',
        modifierOriginal,
        'schema:',
        collection.schema,
      );
      throw error;
    }
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
  {
    attributeDescriptors,
    collection,
    defaultLocale,
  }: {
    attributeDescriptors: AttributeDescriptor[],
    collection: any,
    defaultLocale: string,
  },
) {
  check(attributeDescriptors, [
    Match.ObjectIncluding({
      attributeName: String,
      attributePathFn: Function,
      msgidFn: Function,
    }),
  ]);
  check(collection, Mongo.Collection);
  check(defaultLocale, String);

  const methodName = `${collection._name}.syncWithTransifex`;

  Meteor.methods({
    [methodName]() {
      if (!this.userId) {
        throw new Meteor.Error(401, 'Please log in first.');
      }
      if (!isAdmin(this.userId)) {
        throw new Meteor.Error(403, 'You are not authorized to import categories.');
      }
      return attributeDescriptors
        .map(attributeDescriptor => syncCollectionWithTransifex({
          attributeDescriptor,
          collection,
          defaultLocale,
        }));
    },
  });

  console.log(`Registered \`${methodName}\` method.`);
}
