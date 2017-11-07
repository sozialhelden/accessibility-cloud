import { geoDistance } from '/both/lib/geo-distance';
import omit from 'lodash/omit';

// Convert a given plain MongoDB document (not transformed) into a GeoJSON feature
export function convertToGeoJSONFeature(doc, coordinatesForDistance) {
  const properties = {};
  Object.assign(properties, doc.properties, doc);
  if (coordinatesForDistance && properties.geometry && properties.geometry.coordinates) {
    properties.distance = geoDistance(coordinatesForDistance, properties.geometry.coordinates);
  }

  delete properties.properties;
  return {
    type: 'Feature',
    geometry: properties.geometry,
    properties: omit(properties, 'geometry', 'originalData'),
  };
};

export function wrapAPIResponseAsGeoJSON({ results, req, related, resultsCount }) {
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
    features: results.map(doc => this.convertToGeoJSONFeature(doc, coordinates, locale)),
  };
};
