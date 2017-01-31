export default function buildFeatureCollectionFromArray(features) {
  const featuresArray = [].concat(features).filter(Boolean);

  return {
    type: 'FeatureCollection',
    featureCount: featuresArray.length,
    features: featuresArray,
  };
}
