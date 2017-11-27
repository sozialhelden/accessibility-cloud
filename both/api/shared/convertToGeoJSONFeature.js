import { geoDistance } from '/both/lib/geo-distance';
import omit from 'lodash/omit';

// Convert a given plain MongoDB document (not transformed) into a GeoJSON feature
export default function convertToGeoJSONFeature(doc, coordinatesForDistance) {
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
}
