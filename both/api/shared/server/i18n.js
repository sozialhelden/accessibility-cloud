import i18nHelpers from '../../shared/i18nHelpers';


export const wrapDocumentAPIResponse = ({ result, req, related }) => {
  const locale = req.query.locale;
  Object.assign(result.properties, {
    localizedCategory: i18nHelpers.getLocalizedCategory.call(result, locale),
    accessibility: i18nHelpers.getLocalizedAccessibility.call(result, locale),
  });
  Object.assign(result, { related });

  if (result.properties.equipmentInfos) {
    Object.keys(result.properties.equipmentInfos).forEach((_id) => {
      if (!result.properties.equipmentInfos[_id].properties) return;
      Object.assign(result.properties.equipmentInfos[_id].properties, {
        localizedCategory: i18nHelpers.getLocalizedCategory.call(result.properties.equipmentInfos[_id], locale),
        accessibility: i18nHelpers.getLocalizedAccessibility.call(result.properties.equipmentInfos[_id], locale),
      });
    });
  }

  return result;
};
