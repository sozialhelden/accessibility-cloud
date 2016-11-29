import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
const { Transform } = Npm.require('zstreams');

const upsert = Meteor.bindEnvironment((onDebugInfo, selector, placeInfo, callback) => {
  try {
    PlaceInfos.upsert(selector, placeInfo, callback);
  } catch (error) {
    console.log('Error while upserting:', placeInfo, error);
    if (onDebugInfo) {
      Meteor.defer(() => {
        onDebugInfo({
          reason: error.reason,
          // stack: error.stack,
        });
      });
    }
    callback(error);
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
      highWaterMark: 3,
      transform(placeInfo, encoding, callback) {
        const originalId = placeInfo.properties.originalId;

        if (!originalId) {
          skippedRecordCount++;
          onDebugInfo({ placeInfoWithoutOriginalId: placeInfo });
          if (ignoreSkippedPlaces) {
            callback(null, null);
          } else {
            const error = new Error('No originalId given in PlaceInfo');
            this.emit('error', error);
            callback(error);
          }
          return;
        }

        check(originalId, String);

        Object.assign(placeInfo.properties, { sourceId, sourceImportId });

        upsert(onDebugInfo, {
          'properties.sourceId': sourceId,
          'properties.originalId': originalId,
        }, placeInfo, callback);
      },
      flush(callback) {
        console.log('Done with upserting!');
        callback();
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
