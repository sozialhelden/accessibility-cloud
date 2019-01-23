// Ported from Wheelmap's source code

export function tile2latlon(x: number, y: number, z: number) {
  const n = 2.0 ** z;
  const lonDeg = (x / n) * 360.0 - 180.0;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const latDeg = 180.0 * (latRad / Math.PI);
  return [Number(latDeg.toFixed(4)), Number(lonDeg.toFixed(4))];
}
