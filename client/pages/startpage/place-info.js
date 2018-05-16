import { Template } from 'meteor/templating';
import i18nHelpers from '/both/api/shared/i18nHelpers';


Template.page_start_place_info.helpers({
  placeName() {
    const locale = window.navigator.language;
    return i18nHelpers.getLocalizedName.call(this, locale) ||
    i18nHelpers.getLocalizedCategory.call(this, locale) ||
      '';
  },
});
