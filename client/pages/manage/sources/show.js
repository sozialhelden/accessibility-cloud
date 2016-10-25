import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { _ } from 'meteor/stevezhu:lodash';

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

function getColorForWheelchairAccessiblity (placeData) {
  try {
    if (placeData.properties.accessibility.accessibleWith.wheelchair === true) {
      return 'green';
    } else if (placeData.properties.accessibility.accessibleWith.wheelchair === false) {
      return 'red';
    }
  }
  catch (e) {
    console.warn('Failed to get color for', e, placeData);
  }
  return 'grey';
}

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
      if (result.length === 0) {
        return;
      }

      const geoMarkerData = _.map(result, (item) => ({
        type: 'Feature',
        geometry: item.geometry,
        placeData: item,
      }));

      const markers = new L.geoJson(geoMarkerData, {
        pointToLayer(feature, latlng) {
          const categoryIconName = _.get(feature, 'placeData.properties.category') || 'place';
          const color = getColorForWheelchairAccessiblity(feature.placeData);

          const acIcon = new L.AccessibilityIcon({
            iconUrl: `/icons/categories/${categoryIconName}.png`,
            className: `ac-marker ${color}`,
            iconSize: [36, 36],
          });
          const marker = L.marker(latlng, { icon: acIcon })
          marker.on('click', function(e, o) {
            console.log('clicked2:', e, o);
            Session.set('SelectedPlace', e.target.feature.placeData);
          });

          return marker;
        },
      });

      markers.addTo(map);
      map.fitBounds(markers.getBounds().pad(0.3));
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
  selectedPlace() {
    return Session.get('SelectedPlace');
  },
  placeDetailsVisible() {
    return Session.get('PlaceDetailsVisible');
  },
});

Template.sources_show_page.events({
  'click .js-click-show-details'(event) {
    Session.set('PlaceDetailsVisible', true);
    event.preventDefault();
  },
  'click .js-click-hide-details'(event) {
    Session.set('PlaceDetailsVisible', false);
    event.preventDefault();
  },
  'click .js-close'(event) {
    Session.set('SelectedPlace', undefined);
    event.preventDefault();
  },
});


