import { Images, buildFullImageUrl } from '../images';

Images.wrapCollectionAPIResponse = ({ results, resultsCount }) => ({
  count: results.count,
  totalCount: resultsCount,
  images: results.map(r => (
    {
      _id: r._id,
      imagePath: r.remotePath,
      url: buildFullImageUrl(r),
      date: r.timestamp,
      mimeType: r.mimeType,
      dimensions: r.dimensions || { width: 1, height: 1 },
    }
  )),
});
