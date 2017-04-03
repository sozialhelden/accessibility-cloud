/* globals L */
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
  const placeInfo = placeInfosToShow[currentPlaceIndex];
  if (!placeInfo) {
    return;
  }
  const latlng = [].concat(placeInfo.geometry.coordinates).reverse();
  currentlyShownMarkers.forEach(marker => map.removeLayer(marker));
  currentlyShownMarkers = [
    createMarkerFromFeature(placeInfo, latlng, 2),
    createDescriptionMarker(placeInfo, latlng),
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
  subsManager.subscribe('globalStats.public');
  Meteor.call('PlaceInfos.getRandomPlaceInfos', (error, loadedPlaceInfos) => {
    if (error) {
      console.log('Could not load a random marker:', error);
      return;
    }
    placeInfosToShow = loadedPlaceInfos;
  });
});

Template.page_start.onRendered(function pageRendered() {
  const map = L.map('mapid', { zoomControl: false });
  map.scrollWheelZoom.disable();
  map.fitBounds(
      [[45, -120], [-10, 120]]
  );
  const accessToken = Meteor.settings.public.mapbox;
  L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=${accessToken}`, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'accesssibility-cloud',
    accessToken,
  }).addTo(map);

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
  lastCollectionCount: GlobalStats.lastCollectionCount,
});
