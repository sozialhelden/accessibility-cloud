import { latlon2tile } from './latlon2tile';

type GeoJSONPoint = {
  geometry: {
    type: 'Point',
    coordinates: number[],
  },
};

export default function tileSurrogateKeysForFeature(feature: GeoJSONPoint) {
  console.log(feature);

  if (
    !feature ||
    !feature.geometry ||
    feature.geometry.type !== 'Point' ||
    !feature.geometry.coordinates
  ) {
    return [];
  }
  return Array.from({ length: 22 }).map((_, z) => {
    const [lon, lat] = feature.geometry.coordinates;
    const { x, y } = latlon2tile({ lat, lon }, z);
    return `z${z}-x${x}-y${y}`;
  });
}
