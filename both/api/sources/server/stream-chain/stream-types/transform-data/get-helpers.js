import { _ } from 'lodash';
import getCategories from './get-categories';
import deepFreeze from 'deep-freeze';

// eslint-disable-next-line no-unused-vars
export default function getHelpers() {
  const categoryIdForSynonyms = getCategories();

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
    extractNumber(str) {
      const match = str.match(/-?\d+\.?\d*/);
      return match && Number(match[0]);
    },
  };

  return deepFreeze(helpers);
}
