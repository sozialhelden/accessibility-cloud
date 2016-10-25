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

function respondWithError(res, code, reason) {
  console.error('Responding with error', code, reason);
  respond(res, code, { error: { reason } });
}

function handleUploadRequest(req, res) {
  try {
    const query = url.parse(req.url, true).query;

    const token = query.token;
    if (!token) {
      respondWithError(res, 422, 'Please supply a `token` query string parameter.');
      return;
    }

    const userId = tokensToUserIds[token];
    if (!userId) {
      respondWithError(res, 422, 'Supplied token was invalid. Please supply a valid token!');
      return;
    }

    delete tokensToUserIds[token];

    console.log('Uploading file for user', userId, '…');

    const suffix = mime.extension(req.query.mimeType || 'application/octet-stream');
    const attributes = {
      userId,
      remotePath: `uploads/${userId}/${Random.secret()}${suffix ? `.${suffix}` : ''}`,
      timestamp: new Date(),
      metadata: req.query,
    };
    console.log('Inserting file upload', attributes);
    const _id = UploadedFiles.insert(attributes);
    const fileDoc = UploadedFiles.findOne(_id);

    fileDoc.saveUploadFromStream(req, (error) => {
      if (!error) {
        respond(res, 200, { error: null, uploadedFile: UploadedFiles.findOne(_id) });
        return;
      }
      if (error instanceof Meteor.Error) {
        respond(res, 500, error);
      } else {
        respondWithError(500, 'Internal server error while streaming.');
        console.error('Internal error was:', error, error.stack);
      }
    });
  } catch (error) {
    respondWithError(500, 'Internal server error while handling upload request.');
    console.error('Internal error was:', error, error.stack);
  }
}

WebApp.connectHandlers.use(path, (req, res, next) => {
  Fiber(() => handleUploadRequest(req, res, next)).run();
});
