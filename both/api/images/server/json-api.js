import { Meteor } from 'meteor/meteor';

import { Images } from '../images';

Images.wrapCollectionAPIResponse = ({ results, resultsCount }) => (
  {
    count: results.count,
    totalCount: resultsCount,
    images: results.map(r => ({
      _id: r._id,
      url: `https://${Meteor.settings.public.aws.s3.bucket}.${Meteor.settings.public.aws.region}.amazonaws.com/${r.remotePath}`,
      isoDate: r.timestamp.toISOString(),
      mimeType: r.mimeType })),
  });
