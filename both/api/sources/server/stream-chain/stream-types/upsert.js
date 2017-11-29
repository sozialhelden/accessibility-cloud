import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';
import { Sources } from '../../../sources';
import { Organizations } from '../../../../../api/organizations/organizations';

const { Transform } = Npm.require('zstreams');


const CoordinateMatcher = Match.Where(x => _.isNumber(x) && x !== 0);
const CoordinatesMatcher = [CoordinateMatcher];
const TwoCoordinatesMatcher = Match.Where(x => Match.test(x, CoordinatesMatcher) && x.length === 2);


function getSourceIdsOfSameOrganization(sourceId) {
  const source = Sources.findOne(sourceId, { transform: null });
  if (!source) throw new Error('Source with id', sourceId, 'not found');
  const organizationId = source.organizationId;
  if (!organizationId) throw new Error('Source needs an organization id before proceeding');
  const organization = Organizations.findOne(organizationId, { transform: null });
  const organizationName = organization.name;
  const selector = { organizationId };
  const options = { transform: null, fields: { _id: true } };
  const organizationSourceIds = Sources.find(selector, options).map(s => s._id);
  return { organizationSourceIds, organizationName };
}

export default class Upsert {
  constructor(options) {
    const {
      sourceId,
      ignoreSkippedRecords = true,
      removeMissingRecords = false,
      sourceImportId,
      onDebugInfo,
    } = options;

    check(sourceId, String);
    check(sourceImportId, String);
    check(onDebugInfo, Function);

    this.options = options;

    let skippedDocumentCount = 0;
    let insertedDocumentCount = 0;
    let updatedDocumentCount = 0;
    let removedDocumentCount = 0;

    let firstDocumentWithoutOriginalId = null;
    const streamClass = this.constructor;
    const streamObject = this;

    const { organizationSourceIds, organizationName } = getSourceIdsOfSameOrganization(sourceId);

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      highWaterMark: 3,
      transform: Meteor.bindEnvironment((doc, encoding, callback) => {
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
            this.stream.emit('error', error);
            callback(error);
          }
          return;
        }

        Object.assign(doc.properties, {
          sourceId,
          sourceImportId,
        });

        const postProcessedDoc = streamObject.postProcessBeforeUpserting(doc, { organizationSourceIds, organizationName });

        streamClass.collection.upsert({
          'properties.sourceId': sourceId,
          'properties.originalId': originalId,
        }, { $set: postProcessedDoc }, (upsertError, result) => {
          if (result && result.insertedId) {
            insertedDocumentCount += 1;
          } else if (result && result.numberAffected) {
            updatedDocumentCount += 1;
          }
          streamObject.afterUpsert({ doc: postProcessedDoc, organizationSourceIds }, () => callback(upsertError, result));
        });
      }),
      flush: Meteor.bindEnvironment((callback) => {
        console.log('Done with upserting!');
        if (removeMissingRecords) {
          streamObject.removeMissingRecords(callback);
        }
        streamObject.afterFlush({ organizationSourceIds }, callback);
      }),
    });

    this.endListener = () => {
      if (skippedDocumentCount) {
        onDebugInfo({
          skippedRecordWarning:
            `Skipped ${skippedDocumentCount} documents that had no originalId or invalid coordinates.`,
        });
      }
      onDebugInfo({ insertedDocumentCount, updatedDocumentCount, removedDocumentCount });
    };
    this.stream.on('end', this.endListener);

    this.lengthListener = length => this.stream.emit('length', length);
    this.pipeListener = (source) => {
      this.source = source;
      source.on('length', this.lengthListener);
    };
    this.stream.on('pipe', this.pipeListener);

    this.stream.unitName = 'documents';

    this.bindEnv = fn => Meteor.bindEnvironment((...args) => {
      try {
        fn(...args);
      } catch (error) {
        if (onDebugInfo) {
          Meteor.defer(() => {
            onDebugInfo({
              reason: error.reason,
              // stack: error.stack,
            });
          });
        }
        const callback = args[args.length - 1];
        callback(error);
      }
    });

    this.upsert = this.bindEnv((collection, selector, modifier, callback) => {
      collection.upsert(selector, modifier, callback);
    });

    this.removeMissingRecords = this.bindEnv((callback) => {
      // Remove all MongoDB documents that were not part of this stream's import
      const selector = {
        'properties.sourceId': sourceId,
        'properties.sourceImportId': { $ne: sourceImportId },
      };
      console.log('Removing from ', streamClass.collection._name, selector);
      streamClass.collection.remove(selector, (error, count) => {
        removedDocumentCount = count;
        callback(error);
      });
    });
  }

  // override this in your stream subclass to add/change properties on the document before
  // it is upserted into the DB
  postProcessBeforeUpserting(doc) { // eslint-disable-line class-methods-use-this
    return doc;
  }

  // override this in your stream subclass for postprocessing after upsert
  afterUpsert({ doc, organizationSourceIds }, callback) { // eslint-disable-line class-methods-use-this
    callback();
  }

  // override this in your stream subclass for postprocessing after the import is done
  afterFlush({ organizationSourceIds }, callback) {  // eslint-disable-line class-methods-use-this
    callback();
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
