import { LatLon, Tile } from './types';

export function latlon2tile(
  { lat, lon }: LatLon,
  z: number,
): Tile {
  return {
    z,
    x: Math.floor(((lon + 180) / 360) * Math.pow(2, z)),
    y: Math.floor(((1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
      Math.PI) /
      2) *
      Math.pow(2, z)),
  };
}
