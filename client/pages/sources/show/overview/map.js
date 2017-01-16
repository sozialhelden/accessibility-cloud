/* globals L */

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/stevezhu:lodash';
import { getCurrentPlaceInfo } from './get-current-place-info';


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
    console.warn('Failed to get color for', e, placeData);
  }
  return 'grey';
}

function showPlacesOnMap(map) {
  Meteor.call('getPlacesForSource', FlowRouter.getParam('_id'), (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.length === 0) {
        return;
      }

      const geoMarkerData = _.map(result, (item) => ({
        type: 'Feature',
        geometry: item.geometry,
        placeData: item,
      }));

      if (!geoMarkerData.length) {
        return;
      }

      const markers = new L.geoJson(geoMarkerData, { // eslint-disable-line new-cap
        pointToLayer(feature, latlng) {
          const categoryIconName = _.get(feature, 'placeData.properties.category') || 'place';
          const color = getColorForWheelchairAccessiblity(feature.placeData);

          const acIcon = new L.AccessibilityIcon({
            iconUrl: `/icons/categories/${categoryIconName}.png`,
            className: `ac-marker ${color}`,
            // iconSize: [27, 27],
          });
          const marker = L.marker(latlng, { icon: acIcon });
          marker.on('click', () => {
            FlowRouter.go('placeInfos.show', {
              _id: FlowRouter.getParam('_id'),
              placeInfoId: feature.placeData._id,
            });
          });

          return marker;
        },
      });

      markers.addTo(map);
      map.fitBounds(markers.getBounds().pad(0.3));
    }
  });
}

Template.sources_show_page.onRendered(function sourcesShowPageOnRendered() {
  const map = L.map('mapid', {
    doubleClickZoom: false,
  }).setView([49.25044, -123.137], 13);

  window.map = map;

  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGl4dHVyIiwiYSI6ImNpc2tuMWx1eDAwNHQzMnBremRzNjBqcXIifQ.3jo3ZXnwCVxTkKaw0RPlDg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'accesssibility-cloud',
    accessToken: Meteor.settings.public.mapbox || 'your.mapbox.public.access.token',
  }).addTo(map);

  this.autorun(() => {
    const place = getCurrentPlaceInfo();
    if (place) {
      map.setView(place.geometry.coordinates.reverse(), 14);
    }
  });

  showPlacesOnMap(map);
});
