/* globals L */
/* eslint-disable no-param-reassign */

import keyBy from 'lodash/keyBy';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { PlaceInfos } from '../../../../../both/api/place-infos/place-infos.js';
import createMarkerFromFeature from '../../../../lib/create-marker-from-feature';
import buildFeatureCollectionFromArray from '../../../../../both/lib/build-feature-collection-from-array';
import { getCurrentPlaceInfo } from './get-current-place-info';
import getPlaces from './get-places';

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

  return getPlaces({
    sourceId,
    limit,
    onProgress,
  });
}

function centerOnCurrentPlace(map) {
  const place = getCurrentPlaceInfo();

  if (place) {
    map.setView(place.geometry.coordinates.reverse(), 18);
  }
}

function filterShownMarkers(featureCollection) {
  const result = {};

  result.features = featureCollection.features.filter(
    feature => !idsToShownMarkers[feature.properties._id]
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
    featureCollection.features.push(child);
  });
}

function linkAllRelatedFeatureCollections(featureCollection) {
  if (featureCollection.related) {
    if (featureCollection.related.equipmentInfos) {
      const placeInfosById = keyBy(featureCollection.features, '_id');

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

function showPlacesOnMap(instance, map, unfilteredFeatureCollection) {
  linkAllRelatedFeatureCollections(unfilteredFeatureCollection);

  const featureCollection = filterShownMarkers(unfilteredFeatureCollection);

  if (!featureCollection.featureCount) {
    return;
  }

  const geojsonLayer = new L.geoJson(featureCollection, { // eslint-disable-line new-cap
    pointToLayer(feature, latlng) {
      const id = feature.properties._id;

      if (idsToShownMarkers[id]) {
        return idsToShownMarkers[id];
      }

      const marker = createMarkerFromFeature(feature, latlng);

      marker.on('click', () => {
        FlowRouter.go('placeInfos.show', {
          _id: FlowRouter.getParam('_id'),
          placeInfoId: feature.properties._id,
        }, {
          limit: FlowRouter.getQueryParam('limit'),
        });
      });

      idsToShownMarkers[id] = marker;

      return marker;
    },
  });

  instance.markerClusterGroup.addLayer(geojsonLayer);
  map.addLayer(instance.markerClusterGroup);
  fitBounds(instance, map);
  centerOnCurrentPlace(map);
}

export default function renderMap(map, instance) {
  if (!Meteor.userId()) { return; }

  const newSourceId = FlowRouter.getParam('_id');
  if (newSourceId !== currentSourceId || !instance.markerClusterGroup) {
    resetMarkers(instance, map);
    currentSourceId = newSourceId;
  }

  FlowRouter.watchPathChange();

  const limit = Number(FlowRouter.getQueryParam('limit')) || DEFAULT_NUMBER_OF_PLACES_FETCHED;
  const routeName = FlowRouter.getRouteName();
  const isShowingASinglePlace = routeName === 'placeInfos.show';

  let placesPromise;

  if (isShowingASinglePlace) {
    const placeInfoId = FlowRouter.getParam('placeInfoId');
    const doc = PlaceInfos.findOne(placeInfoId);
    const place = doc && PlaceInfos.convertToGeoJSONFeature(doc);
    const featureCollection = buildFeatureCollectionFromArray([place]);

    showPlacesOnMap(instance, map, featureCollection);
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
        showPlacesOnMap(instance, map, featureCollection);
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
