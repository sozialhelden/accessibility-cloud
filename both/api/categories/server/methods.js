import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TAPi18n } from 'meteor/tap:i18n';
import { Categories } from '/both/api/categories/categories.js';
import { isAdmin } from '/both/lib/is-admin';

Meteor.methods({
  'categories.import'(newCategoryDefinitionsAsCSV) {
    check(newCategoryDefinitionsAsCSV, String);
    if (!this.userId) {
      throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, TAPi18n.__('You are not authorized to import categories.'));
    }

    const lines = newCategoryDefinitionsAsCSV.split(/\n/);
    let lineCount = 0;
    for (const line of lines) {
      if (line === undefined) {
        continue;
      }
      const [parentIds, _id, /* icon */, labelDE, labelEN, synonymStrings] = line.split(/\t/);

      // console.log(
      //   JSON.stringify({ parentIds, id, icon, labelDE, labelEN, synonymStrings }, null, ' ')
      // );

      const synonyms = synonymStrings === undefined ? [] : synonymStrings.split(',');

      Categories.upsert(
        { _id },
        {
          $set: {
            _id,
            icon: _id || 'place',
            parentIds: parentIds.split(',') || [],
            translations: { de: labelDE, en: labelEN },
            synonyms,
          },
        }
      );
      lineCount ++;
    }
    return { result: { lineCount } };
  },
});
