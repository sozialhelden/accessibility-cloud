import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

export default function initializeMap(instance) {
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
