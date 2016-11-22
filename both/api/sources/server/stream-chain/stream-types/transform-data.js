import { check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';
import entries from '/both/lib/entries';
import { Categories } from '/both/api/categories/categories.js';
const { Transform } = Npm.require('zstreams');

const categoryIdForSynonyms = {};
function updateCategories() {
  console.log('Updating categories...');
  Categories.find({}).fetch().forEach(category => {
    category.synonyms.forEach(s => {
      if (s) {
        categoryIdForSynonyms[s] = category._id;
      }
    });
  });
}

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

          const matchingTag = _.find(Object.keys(tags), (tag) => {
            const categoryId = `${tag}=${tags[tag]}`.toLowerCase().replace(' ', '_');
            return categoryIdForSynonyms[categoryId];
          });

          if (matchingTag) {
            const categoryId = `${matchingTag}=${tags[matchingTag]}`
              .toLowerCase()
              .replace(' ', '_');
            return categoryIdForSynonyms[categoryId];
          }
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
    return eval(`(d) => (${javascript})`);
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
    check(mappings, Object);

    const compiledMappings = compileMappings(mappings);

    updateCategories();

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        const output = {};

        for (const [fieldName, fn] of entries(compiledMappings)) {
          const value = fn(chunk);
          if (fieldName.match(/-/)) {
            // Field name is probably a key path like 'a-b-c'
            if (value !== undefined && value !== null) {
              // Don't polute database with undefined properties
              _.set(output, fieldName.replace(/-/g, '.'), value);
            }
          } else {
            output[fieldName] = value;
          }
        }

        callback(null, output);
      },
    });

    this.stream.on('pipe', source => {
      source.on('length', length => this.stream.emit('length', length));
    });

    this.stream.unitName = 'places';
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
