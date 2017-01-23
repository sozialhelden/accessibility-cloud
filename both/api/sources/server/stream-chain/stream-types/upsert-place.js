import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';
const { Transform } = Npm.require('zstreams');


const CoordinateMatcher = Match.Where(x => _.isNumber(x) && x !== 0);
const CoordinatesMatcher = [CoordinateMatcher];
const TwoCoordinatesMatcher = Match.Where(x => Match.test(x, CoordinatesMatcher) && x.length === 2);

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
  constructor({ sourceId, ignoreSkippedPlaces = true, sourceImportId, onDebugInfo }) {
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

        let error = undefined;

        if (!originalId) {
          error = new Error('No originalId given in PlaceInfo');
        } else if (!Match.test(placeInfo.geometry &&
          placeInfo.geometry.coordinates, TwoCoordinatesMatcher)) {
          error = new Error('Coordinates are undefined');
        } else if (!Match.test(originalId, String)) {
          error = new Error('Given originalId was no string');
        }

        if (error) {
          skippedRecordCount++;
          onDebugInfo({ placeInfoWithoutOriginalId: placeInfo });
          if (ignoreSkippedPlaces) {
            callback(null, null);
          } else {
            this.emit('error', error);
            callback(error);
          }
          return;
        }

        Object.assign(placeInfo.properties, {
          sourceId,
          sourceImportId,
          originalData: JSON.stringify(placeInfo),
        });

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
            `Skipped ${skippedRecordCount} PlaceInfo records that had no originalId or no valid coordinates.`,
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
