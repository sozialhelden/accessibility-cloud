import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { addRPCMethodForSyncing } from './rpc-method';
import { extendCollectionSchema } from './collection-schema';
import { addTranslationHelper } from './translation-helper';
import { resourceSlugForCollection } from './resource-slug';
import { cacheRegisteredLocales } from './locales';

export const defaultLocale = 'en_US';

// Makes a given collection document attribute translatable via transifex.
//
// Adds a `translations` attribute on the collection's documents. An example document could look
// like this:
//
//     {
//       name: 'A very good book',          // the translatable attribute
//       translations: {                    // automatically added attribute
//         name: {
//           en_US: 'A very good book',     // translations fetched from transifex
//           de_DE: 'Ein sehr gutes Buch',
//         },
//       },
//       getLocalizedName(locale),         // automatically added helper method on documents
//     }
//
// The method extends the collection's schema and adds a helper method that is automatically named
// after the attribute name. Note that only locales in the form 'de_DE' are imported from transifex.
//
// Additionally, a Meteor RPC method is registered.

export function makeCollectionTranslatable(
  collection, // The collection with documents whose attributes should be made translatable
  attributeName, // The attribute to be made translatable
  msgidFn = (doc) => doc[attributeName] // A msgid is the translation key on transifex.
                                        // The parameter allows to generate the msgid from a
                                        // document instead of just reading the attribute. The
                                        // generated msgid is uploaded to transifex in the
                                        // translation template.
) {
  check(collection, Mongo.Collection);
  check(attributeName, String);
  check(msgidFn, Function);

  const attributePathFn = locale => `translations.${attributeName}.${locale}`;

  addRPCMethodForSyncing({ collection, attributePathFn, defaultLocale, msgidFn });
  addTranslationHelper({ collection, attributeName, attributePathFn, defaultLocale, msgidFn });
  extendCollectionSchema(collection);
  cacheRegisteredLocales(resourceSlugForCollection(collection));
}
