import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Categories } from '/both/api/categories/categories.js';

Meteor.methods({
  'categories.import'(newCategoryDefinitionsAsCSV) {
    check(newCategoryDefinitionsAsCSV, String);

    const lines = newCategoryDefinitionsAsCSV.split(/\n/);
    let lineCount = 0;
    for (const line of lines) {
      if (line === undefined) {
        continue;
      }
      const [parentIds, _id, icon, labelDE, labelEN, synonymStrings] = line.split(/\t/);

      //console.log( JSON.stringify({ parentIds,id,icon,labelDE,labelEN,synonymStrings }, null, ' '));
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
