import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { UploadedFiles } from '../uploaded-files';

// import { startImport } from '/both/api/sources/server/stream-chain/start-import';
// import fs from 'fs';
import aws from 'aws-sdk';
import s3Stream from 's3-upload-stream';
import { _ } from 'meteor/underscore';

UploadedFiles.helpers({
  saveUploadFromStream(stream, callback) {
    const userId = this.userId;
    const { sourceId } = this.metadata;

    console.log('Saving upload from stream for', this);

    check(userId, String);
    check(sourceId, String);
    check(this.remotePath, String);

    aws.config.region = Meteor.settings.public.aws.region;
    aws.config.accessKeyId = Meteor.settings.aws.accessKeyId;
    aws.config.secretAccessKey = Meteor.settings.aws.secretAccessKey;
    aws.config.sslEnabled = true;
    console.log('Using aws config:', aws.config);

    const s3Params = {
      Bucket: Meteor.settings.public.aws.s3.bucket,
      Key: this.remotePath,
      Expires: 60,
      ContentType: (this.metadata && this.metadata.mimeType) || 'application/octet-stream',
      ACL: 'public-read',
    };

    const upload = s3Stream(new aws.S3()).upload(s3Params);

    upload.on('error', Meteor.bindEnvironment(error => {
      console.error('Our params:', s3Params);
      console.error('Remote path:', this.remotePath);
      console.error('Error:', error);
      UploadedFiles.update(
        { _id: this._id },
        { $set: { s3Error: _.pluck(error, 'message', 'statusCode') } }
      );
      callback(error);
    }));

    upload.on('part', Meteor.bindEnvironment(details => {
      console.log('Uploaded part:', details);
    }));

    upload.on('uploaded', Meteor.bindEnvironment(details => {
      console.log('File uploaded:', details);
      UploadedFiles.update({ _id: this._id }, { $set: {
        isUploadedToS3: true,
        storageUrl: details.Location,
      } });
      callback(null, details);
    }));

    stream.pipe(upload);
  },
});
