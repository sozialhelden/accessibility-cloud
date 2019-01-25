/**
 * See the [caching documentation](/docs/caching.md) for information what this code is about.
 */

import { LatLon, Point2D, Circle, Tile } from './types';
import { latlon2tile } from './latlon2tile';

/**
 * @returns A new `LatLon` that is offset by the given coordinates in meters (with an error margin
 *   of a few meters that depends on the latitude)
 */
function offsetLatLon({ lat, lon }: LatLon, offsetInMeters: Point2D): LatLon {
  const earthRadiusInMeters = 6378137;

  const δLat = (offsetInMeters.y / earthRadiusInMeters)
    * (180 / Math.PI);
  const δLon = (offsetInMeters.x / (earthRadiusInMeters * Math.cos(Math.PI * lat / 180)))
    * (180 / Math.PI);

  return {
    lat: lat + δLat,
    lon: lon + δLon * 180 / Math.PI,
  };
}

/**
 * @returns A new tile with same zoom level as the given tile, offset by the given tile coordinates
 */
function offsetTile(tile: Tile, offsetInTileCoordinates: Point2D): Tile {
  return {
    x: tile.x + offsetInTileCoordinates.x,
    y: tile.y + offsetInTileCoordinates.y,
    z: tile.z,
  };
}

/**
 * This algorithm finds a minimal set of
 * [slippy map tile coordinates](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames) that
 * enclose a circle with a given center in latitude/longitude WGS84 coordinates and a given radius
 * in meters:
 */
export default function getMinimalTilesAroundCircle(circle: Circle): Tile[] | null {
  // Calculate boundary rectangle of the circle in lat/lon coordinates
  const topLeft = offsetLatLon(circle, { x: -circle.radius, y: circle.radius });
  const bottomRight = offsetLatLon(circle, { x: circle.radius, y: -circle.radius });

  // Go through all zoom levels to find a zoom level where the top left point tile is right next to
  // the bottom right point tile. Search from smallest to biggest tile size
  for (let z = 22; z >= 0; z -= 1) {
    const topLeftTile = latlon2tile(topLeft, z);
    const bottomRightTile = latlon2tile(bottomRight, z);
    // Find if the vertical or horizontal offsets of top/left and bottom/right tile are right next
    // to each other
    if (topLeftTile.x === bottomRightTile.x - 1 || topLeftTile.y === bottomRightTile.y - 1) {
      // If the circle doesn't fit in 4 tiles, extend them to 6
      const extendX = topLeftTile.x === bottomRightTile.x - 2;
      const extendY = topLeftTile.y === bottomRightTile.y - 2;
      return [
        offsetTile(topLeftTile, { x: 0, y: 0 }),
        offsetTile(topLeftTile, { x: 1, y: 0 }),
        extendX && offsetTile(topLeftTile, { x: 2, y: 0 }),
        offsetTile(topLeftTile, { x: 0, y: 1 }),
        offsetTile(topLeftTile, { x: 1, y: 1 }),
        extendX && offsetTile(topLeftTile, { x: 2, y: 1 }),
        extendY && offsetTile(topLeftTile, { x: 0, y: 2 }),
        extendY && offsetTile(topLeftTile, { x: 1, y: 2 }),
      ].filter(Boolean);
    }
  }

  return null;
}
