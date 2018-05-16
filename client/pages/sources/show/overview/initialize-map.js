import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// import 'mapbox.js';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

export default function initializeMap(instance) {
  const accessToken = Meteor.settings.public.mapbox;
  check(accessToken, String);

  const map = L.mapbox.map(instance.find('.map'), 'mapbox.streets', {
    doubleClickZoom: false,
    accessToken,
  }).setView([49.25044, -123.137], 13);

  window.map = map;
  instance.find('.mapbox-logo').classList.add('mapbox-logo-true');


  return map;
}
