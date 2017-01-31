import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { geoDistance } from '/both/lib/geo-distance';
import { Sources } from '/both/api/sources/sources';
import helpers from './helpers';

export const PlaceInfos = new Mongo.Collection('PlaceInfos');

if (Meteor.isClient) {
  window.PlaceInfos = PlaceInfos;
}

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
  let coordinates = undefined;
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

if (Meteor.isServer) {
  PlaceInfos._ensureIndex({ 'properties.sourceId': 1 });
  PlaceInfos._ensureIndex({ 'properties.sourceImportId': 1 });
  PlaceInfos._ensureIndex({ 'properties.category': 1 });
  PlaceInfos._ensureIndex({ 'properties.name': 1 });
  PlaceInfos._ensureIndex({ 'properties.accessibility.accessibleWith.wheelchair': 1 });
  PlaceInfos._ensureIndex({ 'properties.originalId': 1 });
  PlaceInfos._ensureIndex({ 'properties.sourceId': 1, 'properties.originalId': 1 });
}
