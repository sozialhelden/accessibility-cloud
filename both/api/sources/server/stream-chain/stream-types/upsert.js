import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Disruptions } from '/both/api/disruptions/disruptions';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

const { Transform } = Npm.require('zstreams');


const CoordinateMatcher = Match.Where(x => _.isNumber(x) && x !== 0);
const CoordinatesMatcher = [CoordinateMatcher];
const TwoCoordinatesMatcher = Match.Where(x => Match.test(x, CoordinatesMatcher) && x.length === 2);

const upsert = Meteor.bindEnvironment((onDebugInfo, selector, doc, callback) => {
  try {
    Disruptions.upsert(selector, doc, callback);
  } catch (error) {
    console.log('Error while upserting:', doc, error);
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

export default class Upsert {
  constructor({ sourceId, ignoreSkippedRecords = true, sourceImportId, onDebugInfo }) {
    check(sourceId, String);
    check(sourceImportId, String);
    check(onDebugInfo, Function);

    let skippedDocumentCount = 0;
    let insertedDocumentCount = 0;
    let updatedDocumentCount = 0;

    let firstDocumentWithoutOriginalId = null;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      highWaterMark: 3,
      transform(doc, encoding, callback) {
        const originalId = doc && doc.properties && doc.properties.originalId;

        let error;

        if (!originalId) {
          error = new Error('No originalId given in document');
        } else if (doc.geometry && !Match.test(doc.geometry.coordinates, TwoCoordinatesMatcher)) {
          error = new Error('Coordinates are invalid');
        } else if (!Match.test(originalId, String)) {
          error = new Error('Given originalId was no string');
        }

        if (error) {
          skippedDocumentCount += 1;
          if (!firstDocumentWithoutOriginalId) {
            firstDocumentWithoutOriginalId = doc;
            onDebugInfo({ docWithoutOriginalId: doc });
          }
          if (ignoreSkippedRecords) {
            callback(null, null);
          } else {
            this.emit('error', error);
            callback(error);
          }
          return;
        }

        Object.assign(doc.properties, {
          sourceId,
          sourceImportId,
        });

        upsert(this.constructor.collection, onDebugInfo, {
          'properties.sourceId': sourceId,
          'properties.originalId': originalId,
        }, doc, (upsertError, result) => {
          if (result && result.insertedId) {
            insertedDocumentCount += 1;
          } else if (result && result.numberAffected) {
            updatedDocumentCount += 1;
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
      if (skippedDocumentCount) {
        onDebugInfo({
          skippedRecordWarning:
            `Skipped ${skippedDocumentCount} documents that had no originalId or invalid coordinates.`,
        });
      }
      onDebugInfo({ insertedDocumentCount, updatedDocumentCount });
    };
    this.stream.on('end', this.endListener);

    this.lengthListener = length => this.stream.emit('length', length);
    this.pipeListener = (source) => {
      this.source = source;
      source.on('length', this.lengthListener);
    };
    this.stream.on('pipe', this.pipeListener);

    this.stream.unitName = 'documents';
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
