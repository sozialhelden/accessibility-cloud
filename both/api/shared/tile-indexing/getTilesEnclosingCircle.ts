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
export default function getTilesEnclosingCircle(circle: Circle): Tile[] | null {
  // Calculate boundary rectangle of the circle in lat/lon coordinates
  const northWest = offsetLatLon(circle, { x: -circle.radius, y: circle.radius });
  const southEast = offsetLatLon(circle, { x: circle.radius, y: -circle.radius });

  // Go through all zoom levels to find a zoom level where the top left point tile is right next to
  // the bottom right point tile. Search from smallest to biggest tile size
  for (let z = 21; z >= 0; z -= 1) {
    const northWestTile = latlon2tile(northWest, z);
    const southEastTile = latlon2tile(southEast, z);
    // Find if the vertical or horizontal offsets of top/left and bottom/right tile are right next
    // to each other
    if (northWestTile.x === southEastTile.x - 1 || northWestTile.y === southEastTile.y - 1) {
      // If the circle doesn't fit in 4 tiles, extend them to 6
      const extendX = northWestTile.x === southEastTile.x - 2;
      const extendY = northWestTile.y === southEastTile.y - 2;
      return [
        offsetTile(northWestTile, { x: 0, y: 0 }),
        offsetTile(northWestTile, { x: 1, y: 0 }),
        extendX && offsetTile(northWestTile, { x: 2, y: 0 }),
        offsetTile(northWestTile, { x: 0, y: 1 }),
        offsetTile(northWestTile, { x: 1, y: 1 }),
        extendX && offsetTile(northWestTile, { x: 2, y: 1 }),
        extendY && offsetTile(northWestTile, { x: 0, y: 2 }),
        extendY && offsetTile(northWestTile, { x: 1, y: 2 }),
      ].filter(Boolean);
    }
  }

  return null;
}
