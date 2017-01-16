import { FlowRouter } from 'meteor/kadira:flow-router';
import { PlaceInfos } from '/both/api/place-infos/place-infos.js';

export function getCurrentPlaceInfo() {
  FlowRouter.watchPathChange();
  const placeInfoId = FlowRouter.getParam('placeInfoId');
  if (!placeInfoId) {
    return null;
  }
  const place = PlaceInfos.findOne({ _id: placeInfoId });
  return place;
}
