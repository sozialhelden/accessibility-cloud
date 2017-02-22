import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { Sources } from '/both/api/sources/sources';
import sampleSize from 'lodash/sampleSize';

const MAX_ELIGIBLE_PLACE_INFO_ID_COUNT = 100000;

function getSourceIds() {
  return Sources.find(
    { isShownOnStartPage: true, isDraft: false },
    { fields: { _id: 1 }, transform: null }
  ).fetch().map(source => source._id);
}

function getPlaceInfoIds() {
  const sourceIds = getSourceIds();
  if (sourceIds.length === 0) {
    return [];
  }
  const selector = {
    // TODO: For some reason, we have many PoIs named 'object'. Find out why.
    'properties.name': { $ne: 'object' },
    'properties.sourceId': { $in: sourceIds },
    'properties.accessibility.accessibleWith.wheelchair': true,
  };
  const options = { limit: MAX_ELIGIBLE_PLACE_INFO_ID_COUNT, transform: null, fields: { _id: 1 } };
  return PlaceInfos.find(selector, options).fetch().map(placeInfo => placeInfo._id);
}


export default function pickRandomPlaceInfos(count) {
  const now = new Date();
  const pickedIds = sampleSize(getPlaceInfoIds(), count);
  const selector = { _id: { $in: pickedIds } };
  const options = { transform: null, fields: PlaceInfos.publicFields };
  const placeInfos = PlaceInfos.find(selector, options).fetch();
  console.log('Picked', count, 'random places, needed', +new Date() - now, 'ms.');
  return placeInfos;
}
