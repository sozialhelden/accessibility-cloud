import aws from 'aws-sdk';
import fs from 'fs';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Images } from '../images';

Images.helpers({
  saveUploadFromStream(stream, callback) {
    console.log('Saving image upload from stream for', this);
    check(this.remotePath, String);

    aws.config.region = Meteor.settings.public.aws.region;
    aws.config.accessKeyId = Meteor.settings.aws.accessKeyId;
    aws.config.secretAccessKey = Meteor.settings.aws.secretAccessKey;
    aws.config.sslEnabled = true;
    aws.config.httpOptions = {
      connectTimeout: 1000 * 5,
      timeout: 1000 * 30,
    };

    if (Meteor.settings.public.aws.s3.bucketEndpoint) {
      console.log('Overwriting bucket endpoint ', Meteor.settings.public.aws.s3.bucketEndpoint);
      aws.config.sslEnabled = false;
      aws.config.s3BucketEndpoint = true;
      aws.config.s3 = {
        endpoint: Meteor.settings.public.aws.s3.bucketEndpoint,
      };
    }

    const s3Params = {
      Bucket: Meteor.settings.public.aws.s3.bucket,
      Key: this.remotePath,
      Body: stream,
      ContentType: this.mimeType,
      ACL: 'public-read',
      CacheControl: 'max-age=31104000',
    };

    const awsS3 = new aws.S3();
    let upload = awsS3.upload(s3Params, { partSize: 10 * 1024 * 1024, queueSize: 1 }, Meteor.bindEnvironment((error, data) => {
      if (upload == null || (error && error.code === 'RequestAbortedError')) {
        // was already cancelled
        return;
      }
      upload = null;
      if (error) {
        // console.error('Our params:', s3Params);
        // console.error('Remote path:', this.remotePath);
        console.error('Error:', error);

        let s3Error = { message: error };
        if (typeof error === 'object') {
          s3Error = { message: error.message, code: error.code };
        }

        Images.update(
          { _id: this._id },
          { $set: { s3Error } },
        );
        callback(error);
      } else {
        console.log('File uploaded:', data);
        Images.update({ _id: this._id }, { $set: {
          isUploadedToS3: true,
          storageUrl: data.Location,
        } });
        callback(null, data);
      }
    }));

    // abort upload if stream closes
    stream.on('close', Meteor.bindEnvironment(() => {
      console.log('Stream closed');
      if (upload) {
        upload.abort();
        upload = null;
        Images.remove(
          { _id: this._id },
        );
      }
    }));

    stream.resume();
  },
});
