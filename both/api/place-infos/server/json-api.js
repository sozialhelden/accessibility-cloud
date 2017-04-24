import { _ } from 'meteor/stevezhu:lodash';
import { geoDistance } from '/both/lib/geo-distance';
import { Sources } from '/both/api/sources/sources';
import {
  pathsInObject,
  getTranslationForAccessibilityAttribute,
} from '/server/i18n/ac-format-translations';
import { Categories } from '/both/api/categories/categories';
import { PlaceInfos } from '/both/api/place-infos/place-infos';

const helpers = {
  getLocalizedCategory(locale) {
    const category = Categories.findOne(this.properties.category);
    return category.getLocalizedId(locale);
  },
  getLocalizedAccessibility(locale) {
    const result = _.cloneDeep(this.properties.accessibility);
    const paths = pathsInObject(result);
    paths.forEach(path => {
      _.set(result, `${path}Localized`, getTranslationForAccessibilityAttribute(path, locale));
    });
    return result;
  },
};


// Convert a given plain MongoDB document (not transformed) into a GeoJSON feature
PlaceInfos.convertToGeoJSONFeature = (doc, coordinatesForDistance, locale) => {
  const properties = {};
  Object.assign(properties, doc.properties, doc);
  if (coordinatesForDistance && properties.geometry && properties.geometry.coordinates) {
    properties.distance = geoDistance(coordinatesForDistance, properties.geometry.coordinates);
  }
  if (locale) {
    properties.localizedCategory = helpers.getLocalizedCategory.call(doc, locale);
    properties.accessibility = helpers.getLocalizedAccessibility.call(doc, locale);
  }
  delete properties.properties;
  return {
    type: 'Feature',
    geometry: properties.geometry,
    properties: _.omit(properties, 'geometry', 'originalData'),
  };
};

PlaceInfos.wrapAPIResponse = ({ results, req, related, resultsCount }) => {
  // This is checked in buildSelectorAndOptions already, so no extra check here
  let coordinates;
  if (req.query.latitude && req.query.longitude) {
    coordinates = [Number(req.query.longitude), Number(req.query.latitude)];
  }

  const locale = req.query.locale;

  return {
    type: 'FeatureCollection',
    featureCount: results.length,
    totalFeatureCount: resultsCount,
    related,
    features: results.map(doc => PlaceInfos.convertToGeoJSONFeature(doc, coordinates, locale)),
  };
};

PlaceInfos.relationships = {
  belongsTo: {
    source: {
      foreignCollection: Sources,
      foreignKey: 'properties.sourceId',
    },
  },
};

PlaceInfos.helpers(helpers);

PlaceInfos.includePathsByDefault = ['source.license'];
