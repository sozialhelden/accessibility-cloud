import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';

import subsManager from '/client/lib/subs-manager';


Template.sources_show_page.onCreated(() => {
  subsManager.subscribe('organizations.withContent.mine');
  subsManager.subscribe('sourceImports.public');
  subsManager.subscribe('sources.public');  

  window.SourceImports = SourceImports; // FIXME: we don't need that only for debugging
});

// Extend Leaflet-icon to support colors and category-images
L.AccessibilityIcon = L.Icon.extend({
  options: {
    number: '',
    shadowUrl: null,
    iconSize: new L.Point(25, 41),
    iconAnchor: new L.Point(13, 41),
    popupAnchor: new L.Point(0, -33),
    className: 'leaflet-div-icon accessiblity',
  },

  createIcon: function () {
    const div = document.createElement('div');
    const img = this._createImg(this.options['iconUrl']);
    div.appendChild ( img );
    this._setIconStyles(div, 'icon');
    return div;
  },

  //you could change this to add a shadow like in the normal marker if you really wanted
  createShadow: function () {
    return null;
  }
});


Template.sources_show_page.onRendered(function sourcesShowPageOnRendered() {
  this.autorun(() => {
  });

  const map = L.map('mapid', {
    doubleClickZoom: false,
  }).setView([49.25044, -123.137], 13);

  window.map = map;

  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGl4dHVyIiwiYSI6ImNpc2tuMWx1eDAwNHQzMnBremRzNjBqcXIifQ.3jo3ZXnwCVxTkKaw0RPlDg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'accesssibility-cloud',
    accessToken: 'your.mapbox.public.access.token',
  }).addTo(map);


  Meteor.call('getPlacesForSource', FlowRouter.getParam('_id'), (err, result) => {
    if (err) {
      console.log(err);
    } else {

      // Add markers to map
      if (result.length > 0) {
        const geoMarkerData = _.map(result, (item) => ({
          type: 'Feature',
          geometry: item.geometry,
          placeData: item,
        }));

        function getColorForWheelchairAccessiblity (placeInfo) {
          try {
            if (placeInfo.properties.accessibility.withWheelchair === true) {
              return 'green';
            } else if (placeInfo.properties.accessibility.withWheelchair === false) {
              return 'red';
            }
          }
          catch(e) {
            console.warn("Failed to get color for", e, placeInfo);
          }
          return 'grey';
        };

        const markers = new L.geoJson(geoMarkerData, {
          pointToLayer: function(feature, latlng) {

            const categoryIconName = feature.placeData.category || "place";
            const color = getColorForWheelchairAccessiblity(feature.placeData);

            const acIcon = new L.AccessibilityIcon({
              iconUrl: `/icons/categories/${categoryIconName}.png`,
              className: `ac-marker ${color}`,
              iconSize: [36, 36],
            });
            return L.marker(latlng, { icon: acIcon });
          },
        });

        markers.addTo(map);
        map.fitBounds(markers.getBounds().pad(0.3));
      }
    }
  });
});


Template.sources_show_header.helpers({
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },
});


Template.sources_show_page.helpers({
  sourceImports() {
    return SourceImports.find({ sourceId: FlowRouter.getParam('_id') });
  },
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },
  sourceImport() {
    const selectedImport = SourceImports.findOne({ sourceId: FlowRouter.getParam('importId') });

    if (selectedImport) {
      return selectedImport;
    }
    return SourceImports.findOne({ sourceId: FlowRouter.getParam('_id') });
  },
});
