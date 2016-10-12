import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';

import { PlaceInfos } from '/both/api/place-infos/place-infos.js';

Meteor.methods({
  getSomeGeoJSONPoints() {
    return [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-123.137, 49.25044] } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-123.127, 49.25034] } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-123.137, 49.25134] } },
    ];
  },
  getPointsForSource(sourceId, limitCount = 1000) {
    check(sourceId, String);
    check(limitCount, Number);
    return _.map(PlaceInfos.find({ sourceId }, { limit: limitCount }).fetch(), (pi) => ({
      type: 'Feature',
      geometry: pi.geometry,
    }));
  },
  getPlacesForSource(sourceId, limitCount = 1000) {
    check(sourceId, String);
    check(limitCount, Number);
    // return _.map(PlaceInfos.find({ sourceId }, { limit: limitCount }).fetch(), (pi) => ({
    //   type: 'Feature',
    //   geometry: pi.geometry,
    // }));
    return PlaceInfos.find({ sourceId }, { limit: limitCount }).fetch();
  },
});
