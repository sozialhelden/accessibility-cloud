import { check } from 'meteor/check';

import { UploadedFiles } from '../uploaded-files';

import { startImport } from '/both/api/sources/server/stream-chain/start-import';

UploadedFiles.helpers({
  saveUploadFromStream(stream) {
    const userId = this.userId;
    const { sourceId } = this.metadata;
    console.log('Saving upload from stream for', this);
    check(userId, String);
    check(sourceId, String);
    return startImport({
      sourceId,
      userId,
      inputStreamToReplaceFirstStream: stream,
    });
  },
});
