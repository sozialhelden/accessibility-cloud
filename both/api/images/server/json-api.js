import { Images, buildFullImageUrl } from '../images';

Images.wrapCollectionAPIResponse = ({ results, resultsCount }) => ({
  count: results.count,
  totalCount: resultsCount,
  images: results.map((r) => ({
      _id: r._id,
      url: buildFullImageUrl(r),
      isoDate: r.timestamp.toISOString(),
      mimeType: r.mimeType,
    })),
});
