import EventStream from 'event-stream';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { ObjectProgressStream } from '../object-progress-stream';

const insert = Meteor.bindEnvironment((onDebugInfo, ...args) => {
  try {
    PlaceInfos.insert(...args);
  } catch (error) {
    if (onDebugInfo) {
      onDebugInfo({
        reason: error.reason,
        stack: error.stack,
      });
    }
  }
});

// TODO: Refactor this, this is almost the same as UpsertPlace
export class InsertPlace {
  constructor({ sourceId, sourceImportId, onDebugInfo, onProgress }) {
    check(sourceId, String);
    check(sourceImportId, String);
    check(onDebugInfo, Function);
    check(onProgress, Function);

    this.stream = EventStream.map((placeInfo, callback) => {
      const originalId = `${placeInfo.originalId}`;
      check(originalId, String);
      Object.assign(placeInfo, {
        sourceId,
        sourceImportId,
      });
      insert(onDebugInfo, placeInfo);
      callback(null, placeInfo);
      return placeInfo;
    });

    this.progressStream = new ObjectProgressStream(this.stream, onProgress);
  }
}
