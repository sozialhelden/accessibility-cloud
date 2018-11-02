import { cacheRegisteredLocales } from '../../both/i18n/locales';
import resourceSlugForCollection from './resourceSlugForCollection';
import syncCollectionWithTransifex from './syncCollectionWithTransifex';
import { TranslationStrategy } from './i18nTypes';

export const defaultLocale = 'en_US';

// Makes a given collection document property translatable via transifex. Adds a authorized RPC
// method for syncing.

export default function makeCollectionTranslatable(
  {
    collection, // The collection with documents whose propertys should be made translatable
    translationStrategy,
  }: {
    collection: any,
    translationStrategy: TranslationStrategy,
  }
) {
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
        translationStrategy,
        resourceSlug: resourceSlugForCollection(collection),
      });
    },
  });

  console.log(`Registered \`${methodName}\` method.`);

  cacheRegisteredLocales(resourceSlugForCollection(collection));
}