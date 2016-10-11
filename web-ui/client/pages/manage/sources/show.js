import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';

import subsManager from '/client/lib/subs-manager';


Template.sources_show_page.onCreated(() => {
  subsManager.subscribe('organizations.withContent.mine');
  subsManager.subscribe('sourceImports.public');
  subsManager.subscribe('sources.public');  // this is being reused...

  window.SourceImports = SourceImports; // FIXME: we don't need that only for debugging
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

  // Meteor.call('getPointsForSource', FlowRouter.getParam('_id'), (err, result) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (result.length > 0) {
  //       const markers = new L.geoJson(result);
  //       markers.addTo(map);
  //       map.fitBounds(markers.getBounds().pad(0.3));
  //     }
  //   }
  // });
  const greenIcon = new L.Icon(
  {
    iconUrl: '/icons/marker-shield-green.png',
    iconSize: [36, 36],
    shadowSize: [36, 36],
    iconAnchor: [36/2, 32],
    shadowAnchor: [36/2, 32],
    popupAnchor: [-3, -76],
  });

  const redIcon = new L.Icon(
  {
    iconUrl: '/icons/marker-shield-red.png',
    iconSize: [36, 36],
    shadowSize: [36, 36],
    iconAnchor: [36/2, 32],
    shadowAnchor: [36/2, 32],
    popupAnchor: [-3, -76],
  });

  const grayIcon = new L.Icon(
  {
    iconUrl: '/icons/marker-shield-gray.png',
    iconSize: [36, 36],
    shadowSize: [36, 36],
    iconAnchor: [36/2, 32],
    shadowAnchor: [36/2, 32],
    popupAnchor: [-3, -76],
  });


  Meteor.call('getPlacesForSource', FlowRouter.getParam('_id'), (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.length > 0) {
        const geoMarkerData = _.map(result, (item) => ({
          type: 'Feature',
          geometry: item.geometry,
          data: item,
        }));

        const markers = new L.geoJson(geoMarkerData, {
          pointToLayer: function(feature, latlng) {
            // debugger
            let marker = undefined;
            if (feature.data.isAccessible === true) {
              marker = greenIcon;
            } else if (feature.data.isAccessible === false) {
              marker = redIcon;
            }
            else {
              marker = grayIcon;
            }
            return L.marker(latlng, { icon: marker });
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
