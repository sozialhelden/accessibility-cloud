import * as stream from 'stream';
import * as request from 'request';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { KoboResult } from './transformKoboToA11y';
import { PlaceInfos } from '../../../../../place-infos/place-infos';
import { TrackingEvents } from '../../../../../tracking-events/tracking-events';
import { PlaceInfo } from '@sozialhelden/a11yjson';

const { Transform } = Npm.require('zstreams');

type UpsertResult = {
  doc: Partial<PlaceInfo>,
  result: {
    insertedId?: string,
  },
};

function enrichCreationTrackingEvent(upsertResult: UpsertResult, callback: (error: Error, result?: any) => void) {
  const { doc: placeInfo, result  } = upsertResult;

  if (!placeInfo || !placeInfo.properties || typeof placeInfo.properties.originalData !== 'string') {
    callback(new Error('No data found'), null);
    return;
  }
  // we do not get an _id field on the UpsertResult if it was an update, so we need to query again
  let placeInfoId = result.insertedId;
  if (!placeInfoId) {
    const foundPlace = PlaceInfos.findOne({ 'properties.originalId': placeInfo.properties.originalId },
                                          { transform: null, fields: { } });
    if (foundPlace) {
      placeInfoId = foundPlace._id;
    }
  }

  if (!placeInfoId) {
    throw new Error(`Inserted / updated PlaceInfo not found. This should not happen.`);
  }

  const koboData: KoboResult = JSON.parse(placeInfo.properties.originalData);
  const { uniqueSurveyId } = koboData;
  const [longitude, latitude] = placeInfo.geometry.coordinates;
  if (uniqueSurveyId) {
    console.log(`Adding placeInfoId ${placeInfoId} to 'SurveyCompleted' tracking event with uniqueSurveyId ${uniqueSurveyId}`);
    TrackingEvents.update({ type: 'SurveyCompleted', uniqueSurveyId, placeInfoId: { $exists: false } }, { $set: { placeInfoId, latitude, longitude }});
  }
}

export default class EnrichTrackingEvents {
  stream: any;
  source: any;

  lengthListener = (length: number) => this.stream.emit('length', length);

  requests: any[];

  pipeListener = (source: any) => {
    this.source = source;
    source.on('length', this.lengthListener);
  }

  constructor({
    onDebugInfo = (data: any) => {},
  }) {

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform: Meteor.bindEnvironment(
        (upsertResult: UpsertResult,
         encoding: string,
         callback: (error: Error, result?: any) => void) => {
          try {
            enrichCreationTrackingEvent(upsertResult, callback)
            callback(null, upsertResult);
          } catch (error) {
            callback(error);
          }
        }),
    });

    this.stream.on('pipe', this.pipeListener);
    this.stream.unitName = 'responses';
  }

  abort() {
    if (this.requests) {
      for (const request of this.requests) {
        request.abort && request.abort();
      }
      delete this.requests;
    }
  }

  dispose() {
    if (this.stream) {
      if (this.pipeListener) {
        this.stream.removeListener('pipe', this.pipeListener);
      }
      delete this.stream;
    }
    if (this.source) {
      if (this.lengthListener) {
        this.source.removeListener('length', this.lengthListener);
      }
      delete this.source;
    }
    if (this.requests) {
      for (const request of this.requests) {
        request.abort && request.abort();
      }
      delete this.requests;
    }
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
