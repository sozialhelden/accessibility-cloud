import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';
import { isAdmin } from '/both/lib/is-admin';
import { Meteor } from 'meteor/meteor';
import { geoDistance } from '/both/lib/geo-distance';
import { Sources } from '/both/api/sources/sources';

export const PlaceInfos = new Mongo.Collection('PlaceInfos');

if (Meteor.isClient) {
  window.PlaceInfos = PlaceInfos;
}

PlaceInfos.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

PlaceInfos.publicFields = {
  sourceId: 1,
  originalId: 1,
  lastSourceImportId: 1,
  data: 1,
};

PlaceInfos.helpers({
  editableBy: isAdmin,
});

PlaceInfos.visibleSelectorForUserId = () => ({});
// This would also be allowed
// PlaceInfos.findOptionsFor = (userId) => ({});


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
    properties: _.omit(properties, 'geometry'),
  };
}

PlaceInfos.wrapAPIResponse = ({ results, req, relatedDocuments }) => {
  // This is checked in buildSelectorAndOptions already, so no extra check here
  let coordinates = undefined;
  if (req.query.latitude && req.query.longitude) {
    coordinates = [Number(req.query.longitude), Number(req.query.latitude)];
  }

  return {
    type: 'FeatureCollection',
    featureCount: results.length,
    relatedDocuments,
    features: results.map(doc => convertToGeoJSONFeature(doc, coordinates)),
  };
};

PlaceInfos.relationships = {
  belongsTo: {
    source: {
      foreignCollection: Sources,
      foreignKey: 'sourceId',
    },
  },
};

if (Meteor.isServer) {
  PlaceInfos._ensureIndex({ 'properties.sourceId': 1 });
  PlaceInfos._ensureIndex({ 'properties.originalId': 1 });
  PlaceInfos._ensureIndex({ 'properties.sourceId': 1, 'properties.originalId': 1 });
}
