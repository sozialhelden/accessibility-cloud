import * as stream from 'stream';
import * as request from 'request';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { KoboKey, KoboResult, KoboAttachment } from './transform-kobo';
import { createImageFromStream } from '../../../../../images/server/save-upload-from-stream.js';
import { PlaceInfos } from '../../../../../place-infos/place-infos';

const { Transform } = Npm.require('zstreams');

type InsertedPlace = {
  properties: {
    originalId: string;
    originalData: string;
  },
};

type UpsertResult = {
  doc: InsertedPlace,
  result: {
    insertedId?: string,
  },
};

const koboBaseUrl = 'https://kc.humanitarianresponse.info';

const imageAttachmentFields: KoboKey[] = [
  'inside/toilet/toilet_photo',
  'outside/entrance/picture',
  'Please take a picture of the entrance.',
  'Please take a photo of the toilet.'
];

// find all attachments for the allow fields
function findImageAttachments(data: KoboResult): KoboAttachment[] {
  const attachments = data._attachments;

  return imageAttachmentFields.map((field) => {
    const fileName = data[field];

    if (typeof fileName !== 'string') {
      return null;
    }
    return attachments.find(a => a.filename.endsWith(fileName));
  }).filter(Boolean);
}

function fetchImages(lastResult: UpsertResult, callback: (error: Error, result?: any) => void) {
  const { doc: data, result  } = lastResult;

  if (!data || !data.properties || typeof data.properties.originalData !== 'string') {
    callback(new Error('No data found'), null);
    return;
  }
  // we do not get an _id field on the UpsertResult if it was an update, so we need to query again
  let objectId = result.insertedId;
  if (!objectId) {
    const foundPlace = PlaceInfos.findOne({ 'properties.originalId': data.properties.originalId },
                                          { transform: null, fields: { } });
    if (foundPlace) {
      objectId = foundPlace._id;
    }
  }

  if (!objectId) {
    callback(new Error('No place found'), null);
    return;
  }

  const koboData: KoboResult = JSON.parse(data.properties.originalData);
  const attachments = findImageAttachments(koboData);

  let remainingCallbacksCount = attachments.length;
  const streams = attachments.map((a) => {
    const originalId = `${a.instance}:${a.id}`;

    const fileName = encodeURI(a.filename);
    // sadly the download_url in the kobo attachments will get stale, thus we need to use
    // an undocumented feature to get the correct forward
    //   see also https://github.com/kobotoolbox/kpi/issues/1542
    //   and the implementation in https://github.com/kobotoolbox/kpi/blob/08f06b1c2ce237eac46d0f15e86d44cfc53388a2/jsapp/js/components/submission.es6#L127
    const downloadUrl = `${koboBaseUrl}/attachment/original?media_file=${fileName}`;
    console.log('Downloading image from', downloadUrl);

    const imageDownloadStream = new stream.PassThrough();
    const requestWithRedirect = {
      followAllRedirects: true,
      url: downloadUrl,
      timeout: 15000,
    };
    const requestResult = request(requestWithRedirect).pipe(imageDownloadStream);

    const imageAttributes = {
      originalId,
      objectId,
      mimeType: a.mimetype,
      context: 'place',
      hashedIp: 'ACIMPORT',
      appToken: 'ACIMPORT',
    };
    createImageFromStream(imageDownloadStream, imageAttributes, (error, result) => {
      remainingCallbacksCount -= 1;
      if (remainingCallbacksCount <= 0) {
        callback(null, null);
      }
    });

    imageDownloadStream.on('abort', () => {
      requestResult.abort();
    });

    return requestResult;
  });

  if (streams.length === 0) {
    callback(null, []);
  }

  return streams;
}

export default class UploadKoboAttachments {
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
        (data: UpsertResult,
         encoding: string,
         callback: (error: Error, result?: any) => void) => {
          try {
            this.requests = fetchImages(data, callback);
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
        request.abort();
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
