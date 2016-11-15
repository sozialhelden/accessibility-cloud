import EventStream from 'event-stream';
import { check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';
import entries from '/both/lib/entries';
import { ObjectProgressStream } from '../object-progress-stream';
import { Categories } from '/both/api/categories/categories.js';


const categoryIdForSynonyms = {};
Categories.find({}).fetch().forEach(category => {
  category.synonyms.forEach(s => {
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
          Object.keys(tags).forEach(tag => {
            const categoryId = `${tag}=${tags[tag]}`.toLowerCase().replace(' ', '_');
            return categoryIdForSynonyms[categoryId];
          });
          return 'undefined';
        },
      },
      AXSMaps: {
        estimateRatingFor(obj, voteCount) {
          const maxVotes = _.max([
            obj.spacious,
            obj.ramp,
            obj.parking,
            obj.quiet,
            obj.secondentrance,
          ]);

          if (maxVotes === 0) {
            return undefined;
          }

          return voteCount / maxVotes;
        },
        estimateFlagFor(obj, voteCount) {
          const maxVotes = _.max([
            obj.spacious,
            obj.ramp,
            obj.parking,
            obj.quiet,
            obj.secondentrance,
          ]);

          if (maxVotes === 0) {
            return undefined;
          }

          return voteCount / maxVotes > 0.5;
        },
        getCategoryFromList(categories) {
          if (!categories) {
            return 'undefined';
          }

          for (let i = 0; i < categories.length; ++i) {
            const c = categoryIdForSynonyms[categories[i]];
            if (c) {
              return c;
            }
          }
          return 'undefined';
        },
        guessGeoPoint(lngLat) {
          if (!lngLat) {
            return null;
          }
          let coordinates = lngLat;
          if (lngLat[1] < -20 || lngLat[1] > 60) {
            coordinates = [lngLat[1], lngLat[0]];
          }
          return { coordinates, type: 'Point' };
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
  constructor({ mappings, onProgress, onDebugInfo }) {
    check(mappings, Object);
    check(onProgress, Function);
    const compiledMappings = compileMappings(mappings);

    let firstInputObject = null;
    let firstOutputObject = null;

    this.stream = EventStream.map((data, callback) => {
      if (!firstInputObject) {
        firstInputObject = data;
        onDebugInfo({ firstInputObject: JSON.stringify(firstInputObject) });
      }
      const doc = {};
      for (const [fieldName, fn] of entries(compiledMappings)) {
        const value = fn(data);
        if (fieldName.match(/-/)) {
          // Field name is probably a key path like 'a-b-c'
          if (value !== undefined && value !== null) {
            // Don't polute database with undefined properties
            _.set(doc, fieldName.replace(/-/g, '.'), value);
          }
        } else {
          doc[fieldName] = value;
        }
      }

      if (!firstOutputObject) {
        firstOutputObject = doc;
        onDebugInfo({ firstOutputObject: JSON.stringify(firstOutputObject) });
      }

      doc.originalProperties = JSON.stringify(data, true, 4);
      callback(null, doc);
      return null;
    });

    this.progressStream = new ObjectProgressStream(this.stream, onProgress);
  }

  static getParameterSchema() {
    return new SimpleSchema({

    });
  }
}
