import { Images } from '../images';
import { Meteor } from 'meteor/meteor';

Images.wrapCollectionAPIResponse = ({ results, req, related, resultsCount }) => (
  {
    count: results.count,
    totalCount: resultsCount,
    images: results.map(r => ({
      _id: r._id,
      url: `https://${Meteor.settings.public.aws.s3.bucket}.${Meteor.settings.public.aws.region}.amazonaws.com/${r.remotePath}`,
      mimeType: r.mimeType })),
  });
