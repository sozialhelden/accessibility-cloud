import { geoDistance } from '/both/lib/geo-distance';
import omit from 'lodash/omit';
import i18nHelpers from './i18nHelpers';

// Convert a given plain MongoDB document (not transformed) into a GeoJSON feature
export default function convertToGeoJSONFeature(doc, coordinatesForDistance, locale) {
  const properties = {};
  Object.assign(properties, doc.properties, doc);
  if (coordinatesForDistance && properties.geometry && properties.geometry.coordinates) {
    properties.distance = geoDistance(coordinatesForDistance, properties.geometry.coordinates);
  }

  delete properties.properties;
  const result = {
    type: 'Feature',
    geometry: properties.geometry,
    properties: omit(properties, 'geometry', 'originalData'),
  };

  if (locale) {
    Object.assign(result.properties, {
      localizedCategory: i18nHelpers.getLocalizedCategory.call(doc, locale),
      accessibility: i18nHelpers.getLocalizedAccessibility.call(doc, locale),
    });

    if (result.properties.equipmentInfos) {
      Object.keys(result.properties.equipmentInfos).forEach((_id) => {
        if (!result.properties.equipmentInfos[_id].properties) return;
        Object.assign(result.properties.equipmentInfos[_id].properties, {
          localizedCategory: i18nHelpers.getLocalizedCategory.call(result.properties.equipmentInfos[_id], locale),
          accessibility: i18nHelpers.getLocalizedAccessibility.call(result.properties.equipmentInfos[_id], locale),
        });
      });
    }
  }
  result.properties.name = i18nHelpers.getLocalizedName.call(doc, locale);

  return result;
}

