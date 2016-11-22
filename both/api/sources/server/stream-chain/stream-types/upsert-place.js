import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
const { Writable } = Npm.require('zstreams');

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
    check(sourceId, String);
    check(sourceImportId, String);
    check(onDebugInfo, Function);

    let skippedRecordCount = 0;

    this.stream = new Writable({
      writableObjectMode: true,
      write(placeInfo, encoding, callback) {
        const originalId = placeInfo.properties.originalId;

        if (!originalId) {
          skippedRecordCount++;
          onDebugInfo({ placeInfoWithoutOriginalId: placeInfo });
          callback(new Meteor.Error(422, 'No originalId given in PlaceInfo'));
          return;
        }

        check(originalId, String);

        Object.assign(placeInfo.properties, { sourceId, sourceImportId });
        upsert(onDebugInfo, {
          'properties.sourceId': sourceId,
          'properties.originalId': originalId,
        }, placeInfo);
        callback();
      },
    });

    this.stream.on('end', () => {
      if (skippedRecordCount) {
        onDebugInfo({
          skippedRecordWarning:
            `Skipped ${skippedRecordCount} PlaceInfo records.`,
        });
      }
    });
  }

  static getParameterSchema() {
    return new SimpleSchema({

    });
  }
}
