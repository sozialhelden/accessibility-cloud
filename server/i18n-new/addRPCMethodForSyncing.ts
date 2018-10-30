import { Meteor } from 'meteor/meteor';
import { isAdmin } from '../../both/lib/is-admin';
import { TranslationDescriptor } from './i18nTypes';
import syncCollectionWithTransifex from "./syncCollectionWithTransifex";


export default function addRPCMethodForSyncing(
  {
    translationDescriptors,
    collection,
    defaultLocale,
  }: {
    translationDescriptors: TranslationDescriptor[],
    collection: any,
    defaultLocale: string,
  },
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
        translationDescriptors,
        collection,
        defaultLocale,
      });
    },
  });

  console.log(`Registered \`${methodName}\` method.`);
}
