import EventStream from 'event-stream';
import entries from '/both/lib/entries';
import { acCategories } from '/both/lib/all-categories.js';

function compileMapping(fieldName, javascript) {
  try {
    // replace for minimum security
    // eslint-disable-next-line no-eval

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
              const categoryId = `${tag}_${tags[tag]}`.toLowerCase().replace(' ', '_');

              if (acCategories[categoryId] !== undefined) {
                return categoryId;
              }
            }
          }
          return 'undefined';
        },
      },
    };

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
        doc[fieldName] = fn(data);
      }
      doc.originalData = data;
      callback(null, doc);
      return null;
    });
  }
}
