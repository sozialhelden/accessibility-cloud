import { Meteor } from 'meteor/meteor';
import EventStream from 'event-stream';
import { check } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';

const upsert = Meteor.bindEnvironment((...args) => {
  PlaceInfos.upsert(...args);
});

export class UpsertPlace {
  constructor({ sourceId }) {
    this.stream = EventStream.map((placeInfo, callback) => {
      const originalId = placeInfo.originalId;
      check(originalId, String);
      Object.assign(placeInfo, { sourceId });
      upsert({ sourceId, originalId }, placeInfo);
      callback(null, placeInfo);
      return placeInfo;
    });
  }
}
