/* globals L */
// import 'mapbox.js';
import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import subsManager from '/client/lib/subs-manager';
import { GlobalStats } from '/both/api/global-stats/global-stats';
import createMarkerFromFeature from '/client/lib/create-marker-from-feature';


const PLACE_SWITCH_ANIMATION_DELAY_MS = 5000;

let currentPopup = undefined;
let currentPlaceIndex = 0;
let placeInfosToShow = [];

function createDescriptionPopup(placeInfo, latlng) {
  const html = Blaze.toHTMLWithData(Template.page_start_place_info, placeInfo);

  const markerHeight = 50, markerRadius = 10, linearOffset = 25;
  const popupOffsets = {
    top: [0, 0],
    'top-left': [0,0],
    'top-right': [0,0],
    bottom: [0, -markerHeight],
    'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    left: [markerRadius, (markerHeight - markerRadius) * -1],
    right: [-markerRadius, (markerHeight - markerRadius) * -1]
  };
  const popup = new mapboxgl.Popup({
    offset: popupOffsets,
    className: 'leaflet-div-icon-place-description',
    closeButton: false,
    maxWidth: '300px'
  })
    .setLngLat(latlng)
    .setHTML(html);
  return popup;
}

function showNextRandomPlaceInfo(map) {
  const feature = placeInfosToShow[currentPlaceIndex];
  if (!feature) {
    return;
  }
  const latlng = [].concat(feature.geometry.coordinates);
  if (currentPopup) {
    currentPopup.remove();
  }
  currentPopup = createDescriptionPopup(feature, latlng).addTo(map);
  map.setCenter(latlng);
  map.setZoom(10);
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
  mapboxgl.accessToken = accessToken;
  const map = new mapboxgl.Map({
    container: 'mapid', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 9, // starting zoom
    zoomControl: false
  });

  // map.scrollWheelZoom.disable();
  map.fitBounds(
      [[-120, 45],
      [120, -10]],
  );
  // this.find('.mapbox-logo').classList.add('mapbox-logo-true');
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
