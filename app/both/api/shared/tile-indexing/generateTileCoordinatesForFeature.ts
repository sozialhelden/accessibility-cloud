import { latlon2tile } from './latlon2tile';
import { isArray } from 'lodash';

export default function generateTileCoordinatesForFeature(feature: any) {
  if (!feature) return undefined;
  if (!feature.geometry) return undefined;
  if (feature.geometry.type !== 'Point') return undefined;
  if (!feature.geometry.coordinates) return undefined;
  if (!isArray(feature.geometry.coordinates)) return undefined;
  const result: { [z: number]: { x: number, y: number } } = {};
  const [lon, lat] = feature.geometry.coordinates;
  Array.from({ length: 23 }).forEach((_, z) => {
    const { x, y } = latlon2tile({ lat, lon }, z);
    result[z] = { x, y };
  });
  return result;
}
