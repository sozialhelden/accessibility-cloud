import { Meteor } from 'meteor/meteor';
import EventStream from 'event-stream';
import { check } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';

const upsert = Meteor.bindEnvironment((onDebugInfo, ...args) => {
  try {
    PlaceInfos.upsert(...args);
  } catch (error) {
    if (onDebugInfo) {
      onDebugInfo({
        reason: error.reason,
        stack: error.stack,
      });
    }
  }
});

export class UpsertPlace {
  constructor({ sourceId, sourceImportId, onDebugInfo }) {
    this.stream = EventStream.map((placeInfo, callback) => {
      const originalId = `${placeInfo.originalId}`;
      check(originalId, String);
      Object.assign(placeInfo, {
        sourceId,
        sourceImportId,
      });
      upsert(onDebugInfo, { sourceId, originalId }, placeInfo);
      callback(null, placeInfo);
      return placeInfo;
    });
  }
}
