import { cacheRegisteredLocales } from '../../both/i18n/locales';
import resourceSlugForCollection from './resourceSlugForCollection';
import syncCollectionWithTransifex from './syncCollectionWithTransifex';
import { TranslationDescriptor, SetLocalTranslationFn, GetLocalTranslationFn, MsgidsToTranslationDescriptors } from './i18nTypes';

export const defaultLocale = 'en_US';

// Makes a given collection document property translatable via transifex.
//
// Adds a `translations` property on the collection's documents. An example document could look
// like this:
//
//     {
//       name: {
//         en_US: 'A very good book',     // translations fetched from transifex
//         de_DE: 'Ein sehr gutes Buch',
//       },
//     }
//
// The method adds a RPC method to sync these strings with transifex. Note that only locales in the
// form 'de_DE' are imported from transifex.
//
// For each translated property, you have to supply an object that describes where to find the
// local strings.

export default function makeCollectionTranslatable(
  {
    collection, // The collection with documents whose propertys should be made translatable
    getLocalTranslation,
    setLocalTranslation,
    getMsgidsToTranslationDescriptors,
  }: {
    collection: any,
    getLocalTranslation: GetLocalTranslationFn,
    setLocalTranslation: SetLocalTranslationFn,
    getMsgidsToTranslationDescriptors: () => MsgidsToTranslationDescriptors, // The properties to be made translatable
  }
) {
  // Add RPC method for syncing

  const methodName = `${collection._name}.syncWithTransifex`;

  Meteor.methods({
    [methodName]() {
      // if (!this.userId) {
      //   throw new Meteor.Error(401, 'Please log in first.');
      // }
      // if (!isAdmin(this.userId)) {
      //   throw new Meteor.Error(403, 'You are not authorized to import categories.');
      // }
      syncCollectionWithTransifex({
        defaultLocale,
        getLocalTranslation,
        setLocalTranslation,
        msgidsToTranslationDescriptors: getMsgidsToTranslationDescriptors(),
        resourceSlug: resourceSlugForCollection(collection),
      });
    },
  });

  console.log(`Registered \`${methodName}\` method.`);

  cacheRegisteredLocales(resourceSlugForCollection(collection));
}