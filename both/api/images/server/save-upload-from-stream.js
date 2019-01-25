import aws from 'aws-sdk';
import { PassThrough } from 'stream';
import mime from 'mime-types';
import FileType from 'stream-file-type';
import ImageSize from 'image-size-stream';

import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { Images } from '../images';

export const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/tiff', 'image/tif', 'image/gif'];

function configureS3() {
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
  return new aws.S3();
}

export function createImageFromStream(imageStream, { mimeType, context, objectId, appToken, originalId, hashedIp }, callback) {
  let imageId = null;
  if (originalId) {
    const foundImage = Images.findOne({ originalId }, { transform: null, fields: { } });
    if (foundImage && foundImage.s3Error) {
      // retry download
      console.log('Retrying broken image upload', originalId);
      imageId = foundImage._id;
    } else if (foundImage) {
      console.log('There is already an image with the originalId', originalId);
      callback(null, foundImage);
      return;
    }
  }

  const suffix = mime.extension(mimeType);
  const attributes = {
    context,
    objectId,
    mimeType,
    appToken,
    hashedIp,
    originalId,
    moderationRequired: true,
    isUploadedToS3: false,
    remotePath: `${context}/${objectId}/${Random.secret()}${suffix ? `.${suffix}` : ''}`,
    timestamp: new Date(),
    s3Error: null,
    dimensions: {
      width: 1,
      height: 1,
    },
  };

  if (imageId) {
    console.log('Updating previous image upload', attributes);
    Images.update({ _id: imageId }, attributes);
  } else {
    console.log('Inserting image upload', attributes);
    imageId = Images.insert(attributes);
  }

  // get updated image data
  const image = Images.findOne(imageId);
  const mimeTypeDetector = new FileType();

  imageStream.pipe(mimeTypeDetector);

  mimeTypeDetector.on('file-type', (fileType) => {
    const unsupportedFileType =
        fileType === null || !allowedMimeTypes.includes(fileType.mime.toLowerCase());
    if (unsupportedFileType) {
      callback(new Meteor.Error(415, `Unsupported file-type detected (${fileType ? fileType.mime : 'unknown'}).`));
      imageStream.emit('close');
      imageStream.destroy();
    }
    const mismatchedFileType =
        mimeType && fileType && mimeType.toLowerCase() !== fileType.mime.toLowerCase();
    if (mismatchedFileType) {
      callback(new Meteor.Error(415, `File-type (${fileType.mime}) does not match specified mime-type (${mimeType}).`));
      imageStream.emit('close');
      imageStream.destroy();
    }
  });

  const imageSizeDetector = new ImageSize();
  imageStream.pipe(imageSizeDetector);

  imageSizeDetector.on('size', Meteor.bindEnvironment((dimensions) => {
    Images.update({ _id: imageId }, {
      $set: {
        dimensions: {
          width: dimensions.width,
          height: dimensions.height,
        },
      },
    });
  }));

  image.saveUploadFromStream(imageStream, callback);
}

Images.helpers({
  deleteFromS3(callback) {
    console.log('Deleting uploaded image for', this);
    const awsS3 = configureS3();
    awsS3.deleteObject({
      Bucket: Meteor.settings.public.aws.s3.bucket,
      Key: this.remotePath,
    }, Meteor.bindEnvironment((error, result) => {
      console.log('deleteFromS3 result', error, result);
      callback(error, result);
    }));
  },
  saveUploadFromStream(requestStream, callback) {
    console.log('Saving image upload from stream for', this);
    check(this.remotePath, String);

    const awsS3 = configureS3();

    const pass = new PassThrough();
    const s3Params = {
      Bucket: Meteor.settings.public.aws.s3.bucket,
      Key: this.remotePath,
      Body: pass,
      ContentType: this.mimeType,
      ACL: 'public-read',
      CacheControl: 'max-age=31104000',
    };

    let upload = awsS3.upload(s3Params, Meteor.bindEnvironment((error, data) => {
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
        Images.update({ _id: this._id }, {
          $set: {
            isUploadedToS3: true,
            storageUrl: data.Location,
            updatedAt: new Date(),
          },
        });
        callback(null, data);
      }
    }));


    // abort upload if stream closes
    requestStream.on('close', Meteor.bindEnvironment(() => {
      console.log('Stream closed');
      if (upload) {
        upload.abort();
        upload = null;
        Images.remove(
          { _id: this._id },
        );
      }
    }));

    requestStream.pipe(pass);
    requestStream.resume();

    // s3 upload will not start reading the stream by itself
    requestStream.on('readable', () => {
      // read in whole stream
      while (upload != null && (requestStream.read()) !== null) {
        // do nothing
      }
    });
  },
});
