/* globals L */
// import 'mapbox.js';
import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import subsManager from '/client/lib/subs-manager';
import { GlobalStats } from '/both/api/global-stats/global-stats';
import createMarkerFromFeature from '/client/lib/create-marker-from-feature';


const PLACE_SWITCH_ANIMATION_DELAY_MS = 5000;

let currentlyShownMarkers = [];
let currentPlaceIndex = 0;
let placeInfosToShow = [];

function createDescriptionMarker(placeInfo, latlng) {
  const html = Blaze.toHTMLWithData(Template.page_start_place_info, placeInfo);
  return L.marker(latlng, {
    icon: new L.DivIcon({
      html,
      iconSize: new L.Point(300, 200),
      iconAnchor: new L.Point(150, -20),
      className: 'leaflet-div-icon-place-description',
    }),
  });
}

function showNextRandomPlaceInfo(map) {
  const feature = placeInfosToShow[currentPlaceIndex];
  if (!feature) {
    return;
  }
  const latlng = [].concat(feature.geometry.coordinates).reverse();
  currentlyShownMarkers.forEach(marker => map.removeLayer(marker));
  currentlyShownMarkers = [
    createMarkerFromFeature({ className: 'ac-marker-big ac-place-info', feature, latlng, size: 2 }),
    createDescriptionMarker(feature, latlng),
  ];
  currentlyShownMarkers.forEach(layer => map.addLayer(layer));
  map.setView(latlng, 10);
  currentPlaceIndex++;
  if (currentPlaceIndex > placeInfosToShow.length - 1) {
    currentPlaceIndex = 0;
  }
}

Template.page_start.onCreated(() => {
  subsManager.subscribe('organizations.public');

  subsManager.subscribe('globalStats.lastCollectionCount', 'Sources.withoutDrafts');
  subsManager.subscribe('globalStats.lastCollectionCount', 'PlaceInfos.withoutDrafts');
  subsManager.subscribe('globalStats.lastCollectionCount', 'Sources.withEquipmentInfos');
  subsManager.subscribe('globalStats.lastCollectionCount', 'EquipmentInfos.onlyElevators');
  subsManager.subscribe('globalStats.lastCollectionCount', 'EquipmentInfos.onlyBrokenElevators');

  Meteor.call('PlaceInfos.getRandomPlaceInfos', (error, loadedPlaceInfos) => {
    if (error) {
      console.log('Could not load a random marker:', error);
      return;
    }
    placeInfosToShow = loadedPlaceInfos;
  });
});

Template.page_start.onRendered(function pageRendered() {
  const accessToken = Meteor.settings.public.mapbox;
  const map = L.mapbox.map('mapid', 'mapbox.streets', { accessToken, zoomControl: false });
  map.scrollWheelZoom.disable();
  map.fitBounds(
      [[45, -120],
      [-10, 120]],
  );
  this.find('.mapbox-logo').classList.add('mapbox-logo-true');
  const setTimeout = (firstTime) => {
    // ensure the timeout is not set again after template destruction
    if (firstTime || this.timeout) {
      showNextRandomPlaceInfo(map);
      this.timeout = Meteor.setTimeout(setTimeout, PLACE_SWITCH_ANIMATION_DELAY_MS);
    }
  };
  setTimeout(true);
});

Template.page_start.onDestroyed(function pageDestroyed() {
  Meteor.clearTimeout(this.timeout);
  this.timeout = null;
});

Template.page_start.helpers({
  lastCollectionCount(collectionName) {
    const count = GlobalStats.lastCollectionCount(collectionName);
    if (isNaN(count)) {
      return 0;
    }
    return count;
  },
});
