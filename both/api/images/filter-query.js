import { DefaultModerationFilter } from './images';

const buildMongoQuery = (params) => {
  const filter = Object.assign({}, DefaultModerationFilter);
  if (params.isReported) {
    filter.reports = { $exists: true, $ne: [] };
  }
  if (params.withIp) {
    filter.hashedIp = params.withIp;
  }
  if (params.timestampFrom || params.timestampTo) {
    filter.timestamp = {};
    if (params.timestampFrom) {
      filter.timestamp.$gte = new Date(params.timestampFrom);
    }
    if (params.timestampTo) {
      filter.timestamp.$lte = new Date(params.timestampTo);
    }
  }

  const options = {
    sort: { updatedAt: params.sortByTimestamp, timestamp: params.sortByTimestamp },
    skip: params.skip,
    limit: params.limit,
  };

  return { filter, options };
};

export default buildMongoQuery;
