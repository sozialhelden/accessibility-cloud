import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
//import { FlowRouter } from 'meteor/kadira:flow-router';

// import { Organizations } from '../../api/organizations/organizations.js';
// import './organizations-list-page.html';

Template.page_start.onCreated(function organizationsShowPageOnCreated() {
  this.autorun(() => {
    this.subscribe('organizations.public');
  });
});

Template.page_start.onRendered(function organizationsShowPageOnRendered() {
  this.autorun(() => {
  });
  // el = $('#mapid');

  let map = L.map('mapid');
  map.fitBounds(
      [[ -1, 1],[10,15]]
  );

	L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGl4dHVyIiwiYSI6ImNpc2tuMWx1eDAwNHQzMnBremRzNjBqcXIifQ.3jo3ZXnwCVxTkKaw0RPlDg', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'accesssibility-cloud',
	    accessToken: 'your.mapbox.public.access.token'
	}).addTo(map);
});

Template.page_start.helpers({
  // organizations() {
  //   return Organizations.find({});
  // },
});

