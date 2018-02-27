/* globals L */
/* eslint-disable no-param-reassign */

import keyBy from 'lodash/keyBy';
import { singularize, underscore } from 'inflected';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { PlaceInfos } from '../../../../../both/api/place-infos/place-infos.js';
import { s } from 'meteor/underscorestring:underscore.string';
import { Sources } from '../../../../../both/api/sources/sources.js';
import createMarkerFromFeature from '../../../../lib/create-marker-from-feature';
import buildFeatureCollectionFromArray from '../../../../../both/lib/build-feature-collection-from-array';
import { getCurrentFeature } from './get-current-feature';
import getFeatures from './getFeatures';

const DEFAULT_NUMBER_OF_PLACES_FETCHED = 2000;
const PADDING = 0.02;

const idsToShownMarkers = {};
let currentSourceId = null;
let currentLimit;

function createMarkerClusters(instance) {
  instance.markerClusterGroup = instance.markerClusterGroup || L.markerClusterGroup({
    polygonOptions: {
      color: '#08c',
      weight: 1,
    },
    maxClusterRadius(zoom) {
      const radius = 15 + (((1.5 ** (18 - zoom)) - 1) * 10);
      return Math.round(Math.max(10, Math.min(radius, 120)));
    },
  });
}

function resetMarkers(instance, map) {
  Object.keys(idsToShownMarkers).forEach(key => delete idsToShownMarkers[key]);
  if (instance.markerClusterGroup) {
    map.removeLayer(instance.markerClusterGroup);
    instance.markerClusterGroup = null;
  }
  createMarkerClusters(instance);
}

function fitBounds(instance, map) {
  if (!instance.markerClusterGroup) {
    return;
  }
  const bounds = instance.markerClusterGroup.getBounds();
  if (bounds.isValid()) {
    map.fitBounds(bounds.pad(PADDING));
  }
}

async function loadMarkers({
  instance,
  sourceId,
  limit,
  onProgress,
}) {
  instance.isLoading.set(true);
  instance.loadError.set(null);
  instance.loadProgress.set({});

  const source = Sources.findOne(sourceId);
  if (!source) return null;

  const sourceType = source.lastImportType || 'placeInfos';
  if (!sourceType) return null;

  const url = s.dasherize(s.decapitalize(sourceType));
  return getFeatures({
    url: Meteor.absoluteUrl(url),
    sourceId,
    limit,
    onProgress,
  });
}

function centerOnCurrentPlace(map) {
  const { feature } = getCurrentFeature() || {};

  if (feature) {
    const coordinates = [].concat(feature.geometry.coordinates);
    map.setView(coordinates.reverse(), Math.max(map.getZoom(), 15));
  }
}

function filterShownMarkers(featureCollection) {
  const result = {};

  result.features = featureCollection.features.filter(
    feature => !idsToShownMarkers[feature.properties._id],
  );

  result.featureCount = result.features.length;

  return result;
}

// Sets bidirectional references between has-many docs and belongs-to docs using belongs-to-ids in
// the given featureCollection. All docs have to be GeoJSON Features and will be added to the
// FeatureCollection as features as well.

function linkRelatedFeatureCollection({
  featureCollection,
  hasManyRelationName,
  foreignKey,
  parentDocumentsById,
}) {
  const singularName = singularize(hasManyRelationName);
  const childDocuments = featureCollection.related &&
    featureCollection.related[hasManyRelationName];

  if (!childDocuments) return;

  Object.keys(childDocuments).forEach((childId) => {
    const child = childDocuments[childId];

    if (!child.properties) return;
    const foreignId = child.properties[`${foreignKey}Id`];
    if (!foreignId) return;
    const parent = parentDocumentsById[foreignId];
    if (!parent) return;

    if (!parent[hasManyRelationName]) parent[hasManyRelationName] = [];
    parent[hasManyRelationName].push(child);
    child[foreignKey] = parent;
    child.properties.entityType = singularName;
  });
}

function linkAllRelatedFeatureCollections(featureCollection) {
  if (featureCollection.related) {
    if (featureCollection.related.equipmentInfos) {
      const placeInfosById = keyBy(featureCollection.features, 'properties._id');

      ['disruptions', 'equipmentInfos'].forEach((hasManyRelationName) => {
        linkRelatedFeatureCollection({
          featureCollection,
          hasManyRelationName,
          foreignKey: 'placeInfo',
          parentDocumentsById: placeInfosById,
        });
      });

      linkRelatedFeatureCollection({
        featureCollection,
        foreignKey: 'equipmentInfo',
        hasManyRelationName: 'disruptions',
        parentDocumentsById: featureCollection.related.equipmentInfos,
      });
    }
  }
}

function convertToFeatureCollection(idMap = {}) {
  const features = Object.keys(idMap).map(_id => idMap[_id]);
  return {
    features,
    type: 'FeatureCollection',
  };
}

function showPlacesOnMap(instance, map, sourceId, unfilteredFeatureCollection) {
  linkAllRelatedFeatureCollections(unfilteredFeatureCollection);

  const source = Sources.findOne(sourceId);
  if (!source) return;

  const sourceType = source.getType();
  if (!sourceType) return;

  let featureCollections;

  switch (sourceType) {
    case 'placeInfos': {
      const { disruptions, equipmentInfos } = unfilteredFeatureCollection.related || {};
      featureCollections = {
        disruptions: convertToFeatureCollection(disruptions),
        equipmentInfos: convertToFeatureCollection(equipmentInfos),
        placeInfos: unfilteredFeatureCollection,
      };
      break;
    }
    case 'disruptions':
      featureCollections = { disruptions: unfilteredFeatureCollection };
      break;
    case 'equipmentInfos':
      featureCollections = { equipmentInfos: unfilteredFeatureCollection };
      break;
    default:
      featureCollections = {};
      break;
  }

  Object.keys(featureCollections).forEach((collectionName) => {
    const collectionNameSingular = singularize(collectionName);
    const collectionNameSingularParameterized = underscore(collectionNameSingular).replace(/_/, '-');
    const featureCollection = featureCollections[collectionName];
    const filteredFeatureCollection = filterShownMarkers(featureCollection);
    const geojsonLayer = new L.geoJson(filteredFeatureCollection, { // eslint-disable-line new-cap
      pointToLayer(feature, latlng) {
        const id = feature.properties._id;

        if (idsToShownMarkers[id]) {
          return idsToShownMarkers[id];
        }

        let isWorkingClassName = 'ac-is-working-undefined';
        if (typeof feature.properties.isWorking === 'boolean') {
          isWorkingClassName = `ac-is-working-${feature.properties.isWorking}`;
        }
        if (typeof feature.properties.isEquipmentWorking === 'boolean') {
          isWorkingClassName = `ac-is-working-${feature.properties.isEquipmentWorking}`;
        }
        const marker = createMarkerFromFeature({
          feature,
          latlng,
          className: `ac-${collectionNameSingularParameterized} ${isWorkingClassName}`,
        });

        marker.on('click', () => {
          FlowRouter.go(`${collectionName}.show`, {
            _id: FlowRouter.getParam('_id'),
            [`${collectionNameSingular}Id`]: feature.properties._id,
          }, {
            limit: FlowRouter.getQueryParam('limit'),
          });
        });

        idsToShownMarkers[id] = marker;

        return marker;
      },
    });

    instance.markerClusterGroup.addLayer(geojsonLayer);
  });

  map.addLayer(instance.markerClusterGroup);
  fitBounds(instance, map);
  centerOnCurrentPlace(map);
}

export default function loadAndRenderMap(map, instance) {
  if (!Meteor.userId()) { return; }

  const newSourceId = FlowRouter.getParam('_id');
  if (newSourceId !== currentSourceId || !instance.markerClusterGroup) {
    resetMarkers(instance, map);
    currentSourceId = newSourceId;
  }

  const limit = Number(FlowRouter.getQueryParam('limit')) || DEFAULT_NUMBER_OF_PLACES_FETCHED;
  const routeName = FlowRouter.getRouteName();
  const isShowingASinglePlace = routeName === 'placeInfos.show';

  let placesPromise;

  if (isShowingASinglePlace) {
    const placeInfoId = FlowRouter.getParam('placeInfoId');
    const doc = PlaceInfos.findOne(placeInfoId);
    const place = doc && PlaceInfos.convertToGeoJSONFeature(doc);
    const featureCollection = buildFeatureCollectionFromArray([place]);
    showPlacesOnMap(instance, map, currentSourceId, featureCollection);
    placesPromise = Promise.resolve();
  } else {
    const isDisplayingFewerMarkersThanBefore = currentLimit && limit < currentLimit;
    if (isDisplayingFewerMarkersThanBefore) {
      fitBounds(instance, map);
      return;
    }

    currentLimit = limit;

    placesPromise = loadMarkers({
      instance,
      sourceId: currentSourceId,
      limit,
      onProgress: ({ featureCollection, percentage }) => {
        showPlacesOnMap(instance, map, currentSourceId, featureCollection);
        instance.loadProgress.set({ percentage });
      },
    });
  }

  placesPromise
    .then(
      () => {
        instance.isLoading.set(false);
      },
      (error) => {
        instance.loadError.set(error);
        instance.isLoading.set(false);
      },
    );
  FlowRouter.setQueryParams({ limit });
}
