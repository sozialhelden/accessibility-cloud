import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { PlaceInfos } from '/both/api/place-infos/place-infos.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { Sources } from '/both/api/sources/sources.js';
import {
  checkExistenceAndFullAccessToSourceId,
  checkExistenceAndVisibilityForSourceId,
} from '/both/api/sources/server/privileges';

Meteor.methods({
  getPlacesForSource(sourceId, limitCount = 1000) {
    check(sourceId, String);
    check(limitCount, Number);
    checkExistenceAndVisibilityForSourceId(this.userId, sourceId);

    return PlaceInfos.find({ 'properties.sourceId': sourceId }, { limit: limitCount }).fetch();
  },

  cachePlaceCountForSource(sourceId) {
    check(sourceId, String);
    checkExistenceAndVisibilityForSourceId(this.userId, sourceId);
    const placeInfoCount = PlaceInfos.find({ 'properties.sourceId': sourceId }).count();
    Sources.update(sourceId, { $set: { placeInfoCount } });
  },

  updateDataURLForSource(sourceId, url) {
    check(sourceId, String);
    check(url, String);
    // check(url, SimpleSchema.RegEx.Url);
    checkExistenceAndFullAccessToSourceId(this.userId, sourceId);

    Sources.update(sourceId, { $set: {
      'streamChain.0.parameters.sourceUrl': url,
    } });// , { bypassCollection2: true });


    return true;
  },

  deleteSourceWithId(sourceId) {
    check(sourceId, String);
    checkExistenceAndFullAccessToSourceId(this.userId, sourceId);

    SourceImports.remove({ sourceId });
    PlaceInfos.remove({ 'properties.sourceId': sourceId });
    Sources.remove({ _id: sourceId });
  },

  deleteAllPlacesOfSourceWithId(sourceId) {
    check(sourceId, String);
    checkExistenceAndFullAccessToSourceId(this.userId, sourceId);

    PlaceInfos.remove({ 'properties.sourceId': sourceId });
  },
});
