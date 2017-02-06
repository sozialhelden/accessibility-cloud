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
    let insertedPlaceInfoCount = 0;
    let updatedPlaceInfoCount = 0;

    let firstPlaceWithoutOriginalId = null;

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
          if (!firstPlaceWithoutOriginalId) {
            firstPlaceWithoutOriginalId = placeInfo;
            onDebugInfo({ placeInfoWithoutOriginalId: placeInfo });
          }
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
        });

        upsert(onDebugInfo, {
          'properties.sourceId': sourceId,
          'properties.originalId': originalId,
        }, placeInfo, (upsertError, result) => {
          if (result && result.insertedId) {
            insertedPlaceInfoCount++;
          } else if (result && result.numberAffected) {
            updatedPlaceInfoCount++;
          }
          callback(upsertError, result);
        });
      },
      flush(callback) {
        console.log('Done with upserting!');
        callback();
      },
    });

    this.endListener = () => {
      if (skippedRecordCount) {
        onDebugInfo({
          skippedRecordWarning:
            `Skipped ${skippedRecordCount} PlaceInfo records that had no originalId or no valid coordinates.`,
        });
      }
      onDebugInfo({ insertedPlaceInfoCount, updatedPlaceInfoCount });
    };
    this.stream.on('end', this.endListener);

    this.lengthListener = length => this.stream.emit('length', length);
    this.pipeListener = source => {
      this.source = source;
      source.on('length', this.lengthListener);
    };
    this.stream.on('pipe', this.pipeListener);

    this.stream.unitName = 'places';
  }

  dispose() {
    this.stream.removeListener('end', this.endListener);
    delete this.endListener;
    this.stream.removeListener('pipe', this.pipeListener);
    delete this.pipeListener;
    this.source.removeListener('length', this.lengthListener);
    delete this.source;
    delete this.lengthListener;
    delete this.stream;
    delete this.compiledScript;
  }

  static getParameterSchema() {
    return new SimpleSchema({

    });
  }
}
