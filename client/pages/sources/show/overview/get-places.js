import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { getApiUserToken } from '/client/lib/api-tokens';
import PromisePool from 'es6-promise-pool';
import { HTTP } from 'meteor/http';

const PLACES_BATCH_SIZE = 2000;
const CONCURRENCY_LIMIT = 3;

async function getPlacesBatch(skip, limit, sendProgress) {
  const hashedToken = await getApiUserToken();
  const options = {
    params: {
      skip,
      limit,
      includeSourceIds: FlowRouter.getParam('_id'),
    },
    headers: {
      Accept: 'application/json',
      'X-User-Token': hashedToken,
    },
  };

  return new Promise((resolve, reject) => {
    HTTP.get(Meteor.absoluteUrl('place-infos'), options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        sendProgress(response.data);
        resolve(response);
      }
    });
  });
}

export default async function getPlaces(limit, onProgress = () => {}) {
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
  const firstResponseData = (await getPlacesBatch(0, PLACES_BATCH_SIZE, sendProgress)).data;
  progress = firstResponseData.featureCount;
  numberOfPlacesToFetch = Math.min(firstResponseData.totalFeatureCount, limit);

  // Allow only 3 running requests at the same time. Without this, all requests
  // would be started at the same time leading to timeouts.
  function *generatePromises() {
    if (numberOfPlacesToFetch <= PLACES_BATCH_SIZE) {
      return;
    }
    for (let i = 1; i < (numberOfPlacesToFetch / PLACES_BATCH_SIZE); i++) {
      yield getPlacesBatch(i * PLACES_BATCH_SIZE, PLACES_BATCH_SIZE, sendProgress);
    }
  }
  const pool = new PromisePool(generatePromises(), CONCURRENCY_LIMIT);
  return pool.start();
};
