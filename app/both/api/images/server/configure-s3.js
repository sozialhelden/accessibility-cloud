import aws from 'aws-sdk';
import { Meteor } from 'meteor/meteor';

export default function configureS3() {
  aws.config.region = Meteor.settings.public.aws.region;
  aws.config.accessKeyId = Meteor.settings.aws.accessKeyId;
  aws.config.secretAccessKey = Meteor.settings.aws.secretAccessKey;
  aws.config.sslEnabled = true;
  aws.config.httpOptions = {
    connectTimeout: 1000 * 5,
    timeout: 1000 * 30,
  };

  if (Meteor.settings.public.aws.s3.bucketEndpoint) {
    console.log(
      'Overwriting bucket endpoint',
      Meteor.settings.public.aws.s3.bucketEndpoint,
    );
    aws.config.sslEnabled = false;
    aws.config.s3BucketEndpoint = true;
    aws.config.s3 = {
      endpoint: Meteor.settings.public.aws.s3.bucketEndpoint,
    };
  }
  return new aws.S3();
}
