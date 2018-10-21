import { get } from 'lodash';
import { check, Match } from 'meteor/check';
import { Mongo } from 'meteor/mongo';

import { addRPCMethodForSyncing } from './rpc-method';
import { extendCollectionSchema } from './collection-schema';
import { resourceSlugForCollection } from '../../both/i18n/resource-slug';
import { cacheRegisteredLocales } from '../../both/i18n/locales';
import { AttributeDescriptor } from './i18nTypes';

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
//
// For each translated attribute, you have to supply a descriptor object with these properties:
//
// - `attributeName`: Key path to the attribute in the document
// - `msgidFn`: A msgid is the translation key on transifex. Having a function for this allows to
//   generate the msgid from a document's content. The generated msgid is uploaded to transifex in
//   the translation template. This function takes a document as first parameter and must return a
//   string (the msgid). An example that would just use the string itself as msgid would be
//   `attributeName => doc => doc[attributeName]`
// - `attributePathFn`: This function takes a locale as only parameter (e.g. `en_US`) and must
//   return a key string where the string will be found in the MongoDB document. Example:
//   `attributeName => locale => \`translations.${attributeName}.${locale}\``

export function makeCollectionTranslatable(
  collection, // The collection with documents whose attributes should be made translatable
  attributeDescriptors: AttributeDescriptor[], // The attribute to be made translatable
) {
  check(collection, Mongo.Collection);
  check(attributeDescriptors, [
    Match.ObjectIncluding({
      attributeName: String,
      attributePathFn: Function,
      msgidFn: Function,
    }),
  ]);

  addRPCMethodForSyncing({ collection, attributeDescriptors, defaultLocale });
  attributeDescriptors.forEach(({ attributeName }) => {
    extendCollectionSchema(collection, attributeName);
  });

  cacheRegisteredLocales(resourceSlugForCollection(collection));
}

export const defaultAttributePathFn =
  attributeName => locale => `translations.${attributeName}.${locale}`;

export const defaultMsgidFn = attributeName => doc => get(doc, attributeName);