import { Template } from 'meteor/templating';
import { helpers } from '/both/api/place-infos/place-infos';

Template.page_start_place_info.helpers({
  placeName() {
    const placeInfo = Object.assign({}, this, helpers);
    const locale = window.navigator.language;
    return placeInfo.getLocalizedName(locale) || placeInfo.getLocalizedCategory(locale) || '';
  },
});
