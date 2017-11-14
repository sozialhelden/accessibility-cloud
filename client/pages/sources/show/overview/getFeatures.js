import PromisePool from 'es6-promise-pool';
import { getApiUserToken } from '/client/lib/api-tokens';
import { HTTP } from 'meteor/http';

const FEATURE_BATCH_SIZE = 2000;
const CONCURRENCY_LIMIT = 3;

async function getFeatureBatch({ url, sourceId, skip, limit, sendProgress }) {
  const hashedToken = await getApiUserToken();
  const options = {
    params: {
      skip,
      limit,
      includeSourceIds: sourceId,
    },
    headers: {
      Accept: 'application/json',
      'X-User-Token': hashedToken,
    },
  };

  return new Promise((resolve, reject) => {
    HTTP.get(url, options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        sendProgress(response.data);
        resolve(response);
      }
    });
  });
}

export default async function getFeatures({
  sourceId,
  limit,
  onProgress = () => {},
  url,
}) {
  let progress = 0;
  let numberOfPlacesToFetch = 0;

  const sendProgress = (responseData) => {
    progress += responseData.featureCount;
    onProgress({
      featureCollection: responseData,
      percentage: numberOfPlacesToFetch ? 100 * progress / numberOfPlacesToFetch : 0,
    });
    return responseData;
  };

  // The first batch's response contains the total number of features to fetch.
  const firstResponseData = (await getFeatureBatch({
    sourceId,
    skip: 0,
    limit: FEATURE_BATCH_SIZE,
    sendProgress,
    url,
  })).data;

  progress = firstResponseData.featureCount;
  numberOfPlacesToFetch = Math.min(firstResponseData.totalFeatureCount, limit);

  // Allow only 3 running requests at the same time. Without this, all requests
  // would be started at the same time leading to timeouts.
  function *generatePromises() {
    if (numberOfPlacesToFetch <= FEATURE_BATCH_SIZE) {
      return;
    }
    for (let i = 1; i < (numberOfPlacesToFetch / FEATURE_BATCH_SIZE); i++) {
      yield getFeatureBatch({
        url,
        sourceId,
        skip: i * FEATURE_BATCH_SIZE,
        limit: FEATURE_BATCH_SIZE,
        sendProgress,
      });
    }
  }

  const pool = new PromisePool(generatePromises(), CONCURRENCY_LIMIT);
  return pool.start();
};
