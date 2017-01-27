/* globals L */

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/stevezhu:lodash';
import { getCurrentPlaceInfo } from './get-current-place-info';
import { getApiUserToken } from '/client/lib/api-tokens';

import 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Extend Leaflet-icon to support colors and category-images
L.AccessibilityIcon = L.Icon.extend({
  options: {
    number: '',
    shadowUrl: null,
    iconSize: new L.Point(27, 27),
    iconAnchor: new L.Point(13, 25),
    popupAnchor: new L.Point(0, -33),
    className: 'leaflet-div-icon accessiblity',
  },

  createIcon() {
    const div = document.createElement('div');
    const img = this._createImg(this.options.iconUrl);
    div.appendChild(img);
    this._setIconStyles(div, 'icon');
    return div;
  },

  createShadow() {
    return null;
  },
});

function getColorForWheelchairAccessiblity(placeData) {
  try {
    if (placeData.properties.accessibility.accessibleWith.wheelchair === true) {
      return 'green';
    } else if (placeData.properties.accessibility.accessibleWith.wheelchair === false) {
      return 'red';
    }
  } catch (e) {
    console.warn('Failed to get color for', placeData, e);
  }
  return 'grey';
}

function centerOnCurrentPlace(map) {
  const place = getCurrentPlaceInfo();
  if (place) {
    map.setView(place.geometry.coordinates.reverse(), 16);
  }
}

function showPlacesOnMap(map, geoMarkerData) {
  const geojsonLayer = new L.geoJson(geoMarkerData, { // eslint-disable-line new-cap
    pointToLayer(feature, latlng) {
      const categoryIconName = _.get(feature, 'properties.category') || 'place';
      const color = getColorForWheelchairAccessiblity(feature);

      const acIcon = new L.AccessibilityIcon({
        iconUrl: `/icons/categories/${categoryIconName}.png`,
        className: `ac-marker ${color}`,
        // iconSize: [27, 27],
      });
      const marker = L.marker(latlng, { icon: acIcon });
      marker.on('click', () => {
        FlowRouter.go('placeInfos.show', {
          _id: FlowRouter.getParam('_id'),
          limit: FlowRouter.getParam('limit'),
          placeInfoId: feature.properties._id,
        });
      });

      return marker;
    },
  });

  if (geoMarkerData.features && geoMarkerData.features.length) {
    const markers = L.markerClusterGroup({
      polygonOptions: {
        color: '#08c',
        weight: 1,
      },
    });
    markers.addLayer(geojsonLayer, { chunkedLoading: true });
    map.addLayer(markers);
    map.fitBounds(markers.getBounds().pad(0.02));
    centerOnCurrentPlace(map);
    return markers;
  }
  return null;
}

async function getPlacesBatch(skip, limit) {
  const hashedToken = await getApiUserToken();
  const options = {
    params: {
      skip,
      limit,
      includeSourceIds: FlowRouter.getParam('_id'),
    },
    headers: {
      Accept: 'application/json',
      'X-User-Token': hashedToken,
    },
  };

  return new Promise((resolve, reject) => {
    HTTP.get(Meteor.absoluteUrl('place-infos'), options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

function mergeFeatureCollections(featureCollections) {
  if (!featureCollections || featureCollections.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }
  const result = featureCollections[0];
  featureCollections.slice(1)
    .forEach(c => { result.features = result.features.concat(c.features); });
  return result;
}

async function getPlaces(limit, onProgress = () => {}) {
  const batchSize = 5000;
  const firstResponseData = (await getPlacesBatch(0, batchSize)).data;
  const numberOfPlacesToFetch = Math.min(firstResponseData.totalFeatureCount, limit);
  let progress = firstResponseData.featureCount;
  const sendProgress = () => onProgress({ percentage: 100 * progress / numberOfPlacesToFetch });
  if (numberOfPlacesToFetch > batchSize) {
    const pageIndexes =
      Array.from({ length: (numberOfPlacesToFetch / batchSize) - 1 }, (v, k) => k + 1);
    const promises = pageIndexes.map(index =>
      getPlacesBatch(index * batchSize, batchSize).then(response => {
        progress += response.data.featureCount;
        sendProgress();
        return response.data;
      })
    );
    const responses = await Promise.all(promises);
    const result = mergeFeatureCollections([firstResponseData].concat(responses));
    return result;
  }
  return firstResponseData;
}

Template.sources_show_page_map.onCreated(function created() {
  this.isLoading = new ReactiveVar(true);
  this.loadError = new ReactiveVar();
  this.loadProgress = new ReactiveVar();
  this.isClustering = new ReactiveVar();
});

['isLoading', 'loadError', 'loadProgress', 'isClustering'].forEach(helper =>
  Template.sources_show_page_map.helpers({
    [helper]() { return Template.instance()[helper].get(); },
  })
);

function initializeMap(instance) {
  check(Meteor.settings.public.mapbox, String);

  const map = L.map(instance.find('.map'), {
    doubleClickZoom: false,
  }).setView([49.25044, -123.137], 13);

  window.map = map;

  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGl4dHVyIiwiYSI6ImNpc2tuMWx1eDAwNHQzMnBremRzNjBqcXIifQ.3jo3ZXnwCVxTkKaw0RPlDg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'accesssibility-cloud',
    accessToken: Meteor.settings.public.mapbox,
  }).addTo(map);

  return map;
}

Template.sources_show_page_map.onRendered(function sourcesShowPageOnRendered() {
  const map = initializeMap(this);

  let markers = null;
  const instance = this;

  async function loadPlaces(limit, onProgress) {
    instance.isLoading.set(true);
    instance.loadError.set(null);
    instance.loadProgress.set({});
    if (markers) {
      map.removeLayer(markers);
      markers = null;
    }
    return getPlaces(limit, onProgress);
  }

  this.autorun(() => {
    if (!Meteor.userId()) { return; }
    FlowRouter.watchPathChange();
    const limit = FlowRouter.getQueryParam('limit') || 5000;
    if (!this.currentLimit || limit > this.currentLimit) {
      this.currentLimit = limit;
      loadPlaces(limit, progress => instance.loadProgress.set(progress))
        .then(
          (places) => {
            instance.isClustering.set(true);
            markers = showPlacesOnMap(map, places);
            instance.isClustering.set(false);
            instance.isLoading.set(false);
          },
          (error) => {
            instance.loadError.set(error);
            instance.isLoading.set(false);
          }
        );
      FlowRouter.setQueryParams({ limit });
    }
  });
  this.autorun(() => centerOnCurrentPlace(map));
});
