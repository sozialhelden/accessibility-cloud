import { get } from 'lodash';
import { check, Match } from 'meteor/check';
import { Mongo } from 'meteor/mongo';

import addRPCMethodForSyncing from './addRPCMethodForSyncing';
import extendCollectionSchema from './extendCollectionSchema';
import resourceSlugForCollection from './resourceSlugForCollection';
import { cacheRegisteredLocales } from '../../both/i18n/locales';
import { TranslationDescriptor } from './i18nTypes';

export const defaultLocale = 'en_US';

// Makes a given collection document property translatable via transifex.
//
// Adds a `translations` property on the collection's documents. An example document could look
// like this:
//
//     {
//       name: 'A very good book',          // the translatable property
//       translations: {                    // automatically added property
//         name: {
//           en_US: 'A very good book',     // translations fetched from transifex
//           de_DE: 'Ein sehr gutes Buch',
//         },
//       },
//       getLocalizedName(locale),         // automatically added helper method on documents
//     }
//
// The method extends the collection's schema and adds a helper method that is automatically named
// after the property name. Note that only locales in the form 'de_DE' are imported from transifex.
//
// Additionally, a Meteor RPC method is registered.
//
// For each translated property, you have to supply a descriptor object with these properties:
//
// - `propertyName`: Key path to the property in the document
// - `msgidFn`: A msgid is the translation key on transifex. Having a function for this allows to
//   generate the msgid from a document's content. The generated msgid is uploaded to transifex in
//   the translation template. This function takes a document as first parameter and must return a
//   string (the msgid). An example that would just use the string itself as msgid would be
//   `propertyName => doc => doc[propertyName]`
// - `propertyPathFn`: This function takes a locale as only parameter (e.g. `en_US`) and must
//   return a key string where the string will be found in the MongoDB document. Example:
//   `propertyName => locale => \`translations.${propertyName}.${locale}\``

export default function makeCollectionTranslatable(
  collection, // The collection with documents whose propertys should be made translatable
  translationDescriptors: TranslationDescriptor[], // The property to be made translatable
) {
  check(collection, Mongo.Collection);
  check(translationDescriptors, [
    Match.ObjectIncluding({
      propertyName: String,
      propertyPathFn: Function,
      msgidFn: Function,
    }),
  ]);

  addRPCMethodForSyncing({ collection, translationDescriptors, defaultLocale });
  translationDescriptors.forEach(({ propertyName }) => {
    extendCollectionSchema(collection, propertyName);
  });

  cacheRegisteredLocales(resourceSlugForCollection(collection));
}

export const defaultPropertyPathFn =
  propertyName => locale => `translations.${propertyName}.${locale}`;

export const defaultMsgidFn = propertyName => doc => get(doc, propertyName);