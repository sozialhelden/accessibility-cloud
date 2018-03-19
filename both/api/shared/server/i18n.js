import i18nHelpers from '../../shared/i18nHelpers';


export const wrapDocumentAPIResponse = ({ result, req, related }) => {
  const locale = req.query.locale;
  Object.assign(result.properties, {
    localizedCategory: i18nHelpers.getLocalizedCategory.call(result, locale),
    accessibility: i18nHelpers.getLocalizedAccessibility.call(result, locale),
  });
  Object.assign(result, { related });
  return result;
};
