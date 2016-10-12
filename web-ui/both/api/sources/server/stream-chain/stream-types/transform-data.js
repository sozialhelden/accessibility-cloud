import EventStream from 'event-stream';
import entries from '/both/lib/entries';
import { Categories } from '/both/api/categories/categories.js';

import { _ } from 'meteor/stevezhu:lodash';

const categoryIdForSynonyms = {};
_.each(Categories.find({}).fetch(), function(category) {
  _.each(category.synonyms, function(s) {
    if (s) {
      categoryIdForSynonyms[s] = category._id;
    }
  });
});

function compileMapping(fieldName, javascript) {
  try {
    // eslint-disable-next-line no-unused-vars
    const helpers = {
      OSM: {
        fetchNameFromTags(tags) {
          if (tags == null) {
            return '?';
          }

          return tags.name || 'object';
        },
        fetchCategoryFromTags(tags) {
          if (tags === undefined) {
            return 'empty';
          }

          for (let tag in tags) {
            if (tags.hasOwnProperty(tag)) {
              const categoryId = `${tag}=${tags[tag]}`.toLowerCase().replace(' ', '_');

              if (categoryIdForSynonyms[categoryId]) {

                return categoryIdForSynonyms[categoryId];
              }
            }
          }
          return 'undefined';
        },
      },
    };

    // Should be moved to a sandbox at some point. https://nodejs.org/api/vm.html

    // eslint-disable-next-line no-eval
    return eval(`(row) => (${javascript})`);
  } catch (error) {
    console.error(`Illegal script for ${fieldName}:\n${error}`);
    return () => {};
  }
}

function compileMappings(mappings) {
  const result = {};
  for (const [fieldName, javascript] of entries(mappings)) {
    result[fieldName] = compileMapping(fieldName, javascript);
  }
  return result;
}

export class TransformData {
  constructor({ mappings }) {
    const compiledMappings = compileMappings(mappings);

    this.stream = EventStream.map((data, callback) => {
      const doc = {};
      for (const [fieldName, fn] of entries(compiledMappings)) {
        const value = fn(data);
        if (fieldName.match(/-/)) {
          // field name is probably a key path like 'a-b-c'
          _.set(doc, fieldName.replace('-', '.'), value);
        } else {
          doc[fieldName] = value;
        }
      }
      doc.originalData = data;
      callback(null, doc);
      return null;
    });
  }
}