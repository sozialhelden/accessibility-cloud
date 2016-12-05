import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { geoDistance } from '/both/lib/geo-distance';
import { Sources } from '/both/api/sources/sources';

export const PlaceInfos = new Mongo.Collection('PlaceInfos');

if (Meteor.isClient) {
  window.PlaceInfos = PlaceInfos;
}

// Convert a given plain MongoDB document (not transformed) into a GeoJSON feature
function convertToGeoJSONFeature(doc, coordinatesForDistance) {
  const properties = {};
  Object.assign(properties, doc.properties, doc);
  if (coordinatesForDistance && properties.geometry && properties.geometry.coordinates) {
    properties.distance = geoDistance(coordinatesForDistance, properties.geometry.coordinates);
  }
  delete properties.properties;
  return {
    type: 'Feature',
    geometry: properties.geometry,
    properties: _.omit(properties, 'geometry', 'originalData'),
  };
}

PlaceInfos.wrapAPIResponse = ({ results, req, related }) => {
  // This is checked in buildSelectorAndOptions already, so no extra check here
  let coordinates = undefined;
  if (req.query.latitude && req.query.longitude) {
    coordinates = [Number(req.query.longitude), Number(req.query.latitude)];
  }

  return {
    type: 'FeatureCollection',
    featureCount: results.length,
    related,
    features: results.map(doc => convertToGeoJSONFeature(doc, coordinates)),
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
