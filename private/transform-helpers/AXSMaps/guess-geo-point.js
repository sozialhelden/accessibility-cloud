function guessGeoPoint(lngLat) {
  if (!lngLat) {
    return null;
  }
  let coordinates = lngLat;
  if (lngLat[1] < -20 || lngLat[1] > 60) {
    coordinates = [lngLat[1], lngLat[0]];
  }
  return { coordinates, type: 'Point' };
}
