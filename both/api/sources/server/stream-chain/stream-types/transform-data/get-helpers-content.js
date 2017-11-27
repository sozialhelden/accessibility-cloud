/* global Assets: true */

/*
 * This configuration needs to match the directory structure in
 * /private/transform-helpers.
 */
const AVAILABLE_HELPERS = {
  AXSMaps: {
    estimateFlagFor: 'estimate-flag-for.js',
    estimateRatingFor: 'estimate-rating-for.js',
    getCategoryFromList: 'get-category-from-list.js',
    guessGeoPoint: 'guess-geo-point.js',
  },

  OSM: {
    fetchNameFromTags: 'fetch-name-from-tags.js',
    fetchCategoryFromTags: 'fetch-category-from-tags.js',
  },

  extractNumber: 'extract-number.js',
  convertOSGB36ToWGS84Point: 'convert-osgb36-to-wgs84-point.js',
  convert3LetterLanguageCode: 'convert-3-letter-language-code.js',
};

const HELPERS_BASE_PATH = 'transform-helpers';

const readAsset = relativePath => Assets.getText(`${HELPERS_BASE_PATH}${relativePath}`);

const getContents = (basePath, dirMap) => {
  const entries = Object.keys(dirMap);

  return entries.reduce((acc, key) => {
    const value = dirMap[key];

    if (typeof value === 'string') {
      return Object.assign({}, acc, {
        [key]: readAsset(`${basePath}/${value}`),
      });
    }

    return Object.assign({}, acc, {
      [key]: getContents(`${basePath}/${key}`, value),
    });
  }, {});
};

const turnObjectIntoString = obj => `{
  ${Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const stringifiedValue = value instanceof Object ? turnObjectIntoString(value) : value;

    return `
      ${acc}
      ${key}: ${stringifiedValue},
    `;
  }, '')}
}`;

export default function getHelpersContent() {
  const helpersObj = getContents('', AVAILABLE_HELPERS);
  return turnObjectIntoString(helpersObj);
}
