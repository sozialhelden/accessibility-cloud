import { Meteor } from 'meteor/meteor';
import EventStream from 'event-stream';
import { check } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';

const upsert = Meteor.bindEnvironment((...args) => {
  PlaceInfos.upsert(...args);
});

export class UpsertPlace {
  constructor({ sourceId }) {
    this.stream = EventStream.mapSync((placeInfo, callback) => {
      const originalId = placeInfo.originalId;
      check(originalId, String);
      upsert({ sourceId, originalId }, placeInfo);
      callback(null, placeInfo);
    });
  }
}
