// Adds a middleware that accepts file uploads via POST under /file-upload.
// Each file upload needs a token that a user can get via the 'getFileUploadToken' Meteor method.
// The token has to be supplied as 'token' GET parameter. The file is supplied directly in the
// request body.
// This is a bit more complex than just saving a file and serving it statically --
// note that we might have more than one app server container. For this reason
// the files are streamed to Amazon S3 to be available for users of all app containers.
// Files are directly streamed to AWS S3, a reference to the S3 URL is saved in the 'uploadedFiles'
// MongoDB collection.

import Fiber from 'fibers';
import multipart from 'connect-multiparty';
import bodyParser from 'body-parser';
import url from 'url';
import mime from 'mime-types';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { WebApp } from 'meteor/webapp';

import { UploadedFiles } from '/both/api/uploaded-files/uploaded-files';

const tokensToUserIds = {};
const path = '/file-upload';
const multipartMiddleware = multipart();

Meteor.methods({
  getFileUploadToken() {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in before uploading files.');
    }
    const token = Random.secret();
    tokensToUserIds[token] = this.userId;
    return token;
  },
});

function respond(res, code, json) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(json));
}

function handleUploadRequest(req, res) {
  try {
    const query = url.parse(req.url, true).query;
    const token = query.token;
    if (!token) {
      respond(res, 422, { error: { reason: 'Please supply a `token` query string parameter.' } });
      return;
    }

    const userId = tokensToUserIds[token];
    if (!userId) {
      respond(res, 422, { error: {
        reason: 'Supplied token was invalid. Please supply a valid token!',
      } });
      return;
    }
    delete tokensToUserIds[token];

    console.log('Uploading file for user', userId, '…');

    // const suffix = mime.extension(req.files.file);
    const attributes = {
      userId,
      remotePath: `${userId}/${Random.id()}`,
      timestamp: new Date(),
      metadata: req.query,
    };
    console.log('Inserting file upload', attributes);
    const _id = UploadedFiles.insert(attributes);
    const fileDoc = UploadedFiles.findOne(_id);
    fileDoc.saveUploadFromStream(req, (error) => {
      if (error) {
        const errorResponse = (error instanceof Meteor.Error) ?
          error :
          { error: { reason: 'Internal server error while streaming.' } };
        console.error('Error while streaming file upload:', error);
        respond(res, 500, errorResponse);
      } else {
        respond(res, 200, { error: null, fileDoc });
      }
    });
  } catch (error) {
    console.error('Could not upload file:', error, error.stack);
    respond(res, 500, { error: { reason: 'Internal server error.' } });
  }
}

WebApp.connectHandlers.use(path, (req, res, next) => {
  Fiber(() => handleUploadRequest(req, res, next)).run();
});
