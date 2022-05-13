import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Future from 'fibers/future';

import { isAdmin } from '../../../lib/is-admin';
import { Images } from '../images';
import configureS3 from './configure-s3';

function deleteImageFromS3(image, callback) {
  console.log('Deleting uploaded image for', image);
  const awsS3 = configureS3();
  awsS3.deleteObject({
    Bucket: Meteor.settings.public.aws.s3.bucket,
    Key: image.remotePath,
  }, Meteor.bindEnvironment((error, result) => {
    console.log('deleteFromS3 result', error, result);
    callback(error, result);
  }));
}


Meteor.methods({
  'images.approve'(imageId) {
    check(imageId, String);

    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'You have no rights to approve images');
    }

    const image = Images.findOne({ _id: imageId });
    if (!image) {
      throw new Meteor.Error(404, 'Image not found');
    }

    // approve, remove reports and unset moderationRequired
    Images.update(imageId, {
      $set: {
        moderationRequired: false,
        updatedAt: new Date(),
      },
      $unset: {
        reports: true,
      },
    });
  },
  async 'images.reject'(imageId) {
    check(imageId, String);

    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'You have no rights to reject images');
    }

    const image = Images.findOne({ _id: imageId });
    if (!image) {
      throw new Meteor.Error(404, 'Image not found');
    }

    if (image.isUploadedToS3 && !image.s3Error) {
      const deleteFuture = new Future();
      deleteImageFromS3(image, (error, result) => {
        if (error) {
          deleteFuture.throw(new Meteor.Error(500, 'Failed deleting image on s3'));
        } else {
          deleteFuture.return(result);
        }
      });

      deleteFuture.wait();
    }

    Images.remove({ _id: imageId });
    return {};
  },
  'images.rotate'(imageId) {
    check(imageId, String);

    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'You have no rights to rotate images');
    }

    const image = Images.findOne({ _id: imageId }, { transform: null });
    if (!image) {
      throw new Meteor.Error(404, 'Image not found');
    }

    const modifier = {
      $set: {
        angle: ((image.angle || 0) - 90) % 360,
      },
    };

    console.log('Modifier', modifier);
    Images.update(imageId, modifier);
  },
});
