import { tile2latlon } from './tile2latlon';

export function tile2GeoJSONPolygon({ x, y, z }: { x: number, y: number, z: number }) {
  const [north, west] = tile2latlon(x, y, z);
  const [south, east] = tile2latlon(x + 1, y + 1, z);
  return {
    type: 'Polygon',
    coordinates: [
      [
        [east, north],
        [east, south],
        [west, south],
        [west, north],
        [east, north],
      ],
    ],
  };
}
