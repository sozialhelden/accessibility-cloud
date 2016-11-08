import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check } from 'meteor/check';

import { PlaceInfos } from '/both/api/place-infos/place-infos.js';
import { Sources } from '/both/api/sources/sources.js';
import { checkExistenceAndFullAccessToSourceId } from '/both/api/sources/server/privileges';

Meteor.methods({
  getSomeGeoJSONPoints() {
    return [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-123.137, 49.25044] } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-123.127, 49.25034] } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-123.137, 49.25134] } },
    ];
  },

  getPointsForSource(sourceId, limitCount = 1000) {
    checkExistenceAndFullAccessToSourceId(this.userId, sourceId);
    check(sourceId, String);
    check(limitCount, Number);

    return PlaceInfos.find(
      { 'properties.sourceId': sourceId },
      { limit: limitCount }
    ).fetch().map(pi => ({
      type: 'Feature',
      geometry: pi.geometry,
    }));
  },

  getPlacesForSource(sourceId, limitCount = 1000) {
    check(sourceId, String);
    check(limitCount, Number);
    checkExistenceAndFullAccessToSourceId(this.userId, sourceId);

    return PlaceInfos.find({ 'properties.sourceId': sourceId }, { limit: limitCount }).fetch();
  },

  updateDataURLForSource(sourceId, url) {
    check(sourceId, String);
    check(url, String);
    // check(url, SimpleSchema.RegEx.Url);
    checkExistenceAndFullAccessToSourceId(this.userId, sourceId);

    Sources.update(sourceId, { $set: {
      'streamChain.0.parameters.sourceUrl': url,
    } });// , { bypassCollection2: true });

    console.log('Updated source', sourceId, 'with new URL:', url);

    return true;
  },
});
