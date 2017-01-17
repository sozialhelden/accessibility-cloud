/* globals L */

import { Meteor } from 'meteor/meteor';
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
          placeInfoId: feature.properties._id,
        });
      });

      return marker;
    },
  });

  if (geoMarkerData.features && geoMarkerData.features.length) {
    const markers = L.markerClusterGroup();
    markers.addLayer(geojsonLayer);
    map.addLayer(markers);
    map.fitBounds(markers.getBounds().pad(0.3));
  }
}


function getPlaces(callback) {
  getApiUserToken((error, hashedToken) => {
    if (error) {
      console.error('Could not get API token for getting place infos over the API.');
      return;
    }

    const options = {
      params: {
        // latitude: 40.728292,
        // longitude: -73.9875852,
        // accuracy: 10000,
        limit: 150000,
        includeSourceIds: FlowRouter.getParam('_id'),
      },
      headers: {
        Accept: 'application/json',
        'X-User-Token': hashedToken,
      },
    };

    HTTP.get(Meteor.absoluteUrl('place-infos'), options, callback);
  });
}

Template.sources_show_page_map.onRendered(function sourcesShowPageOnRendered() {
  check(Meteor.settings.public.mapbox, String);

  const map = L.map('mapid', {
    doubleClickZoom: false,
  }).setView([49.25044, -123.137], 13);

  window.map = map;

  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGl4dHVyIiwiYSI6ImNpc2tuMWx1eDAwNHQzMnBremRzNjBqcXIifQ.3jo3ZXnwCVxTkKaw0RPlDg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'accesssibility-cloud',
    accessToken: Meteor.settings.public.mapbox,
  }).addTo(map);

  this.autorun(() => {
    const place = getCurrentPlaceInfo();
    if (place) {
      map.setView(place.geometry.coordinates.reverse(), 14);
    }
  });

  getPlaces((error, response) => {
    if (error || response.statusCode !== 200) {
      const message = 'Could not load places:';
      alert(message, error);
      console.error(message, error, error.stack);
      return;
    }
    showPlacesOnMap(map, response.data);
  });
});
