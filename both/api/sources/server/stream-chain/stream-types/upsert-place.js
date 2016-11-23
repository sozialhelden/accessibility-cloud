import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
const { Transform } = Npm.require('zstreams');

const upsert = Meteor.bindEnvironment((onDebugInfo, selector, placeInfo, callback) => {
  try {
    PlaceInfos.upsert(selector, placeInfo, () => {
      callback(null, placeInfo);
    });
  } catch (error) {
    if (onDebugInfo) {
      onDebugInfo({
        reason: error.reason,
        stack: error.stack,
      });
    }
    if (callback) {
      callback(error);
    }
  }
});

export class UpsertPlace {
  constructor({ sourceId, ignoreSkippedPlaces, sourceImportId, onDebugInfo }) {
    check(sourceId, String);
    check(sourceImportId, String);
    check(onDebugInfo, Function);

    let skippedRecordCount = 0;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(placeInfo, encoding, callback) {
        const originalId = placeInfo.properties.originalId;

        if (!originalId) {
          skippedRecordCount++;
          onDebugInfo({ placeInfoWithoutOriginalId: placeInfo });
          if (ignoreSkippedPlaces) {
            callback(null, null);
          } else {
            callback(new Error('No originalId given in PlaceInfo'));
          }
          return;
        }

        check(originalId, String);

        Object.assign(placeInfo.properties, { sourceId, sourceImportId });

        upsert(onDebugInfo, {
          'properties.sourceId': sourceId,
          'properties.originalId': originalId,
        }, placeInfo, callback);

        // callback(null, placeInfo);
      },
    });

    this.stream.on('end', () => {
      if (skippedRecordCount) {
        onDebugInfo({
          skippedRecordWarning:
            `Skipped ${skippedRecordCount} PlaceInfo records that had no originalId.`,
        });
      }
    });

    this.stream.on('pipe', source => {
      source.on('length', length => this.stream.emit('length', length));
    });

    this.stream.unitName = 'places';
  }

  static getParameterSchema() {
    return new SimpleSchema({

    });
  }
}
