// @flow

export default function wrapAPIResponseAsGeoJSON({ results, req, related, resultsCount }) {
  // This is checked in buildSelectorAndOptions already, so no extra check here
  let coordinates;
  if (req.query.latitude && req.query.longitude) {
    coordinates = [Number(req.query.longitude), Number(req.query.latitude)];
  }

  const locale = req.query.locale;

  return {
    type: 'FeatureCollection',
    featureCount: results.length,
    totalFeatureCount: resultsCount,
    related,
    features: results.map(doc => this.convertToGeoJSONFeature(doc, coordinates, locale)),
  };
}
