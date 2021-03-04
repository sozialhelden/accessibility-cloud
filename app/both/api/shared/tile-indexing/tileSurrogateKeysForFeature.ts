import { latlon2tile } from './latlon2tile';
import { Tile } from './types';

type GeoJSONPoint = {
  geometry: {
    type: 'Point',
    coordinates: number[],
  },
};

export function surrogateKeyForTile(tile: Tile): string {
  const { x, y, z } = tile;
  return `z${z}-x${x}-y${y}`;
}

export default function tileSurrogateKeysForFeature(feature: GeoJSONPoint) {
  if (
    !feature ||
    !feature.geometry ||
    feature.geometry.type !== 'Point' ||
    !feature.geometry.coordinates
  ) {
    return [];
  }
  return Array.from({ length: 21 }).map((_, z) => {
    const [lon, lat] = feature.geometry.coordinates;
    return surrogateKeyForTile(latlon2tile({ lat, lon }, z));
  });
}
