/* globals geodesy _ */
function convertOSGB36ToWGS84Point(x, y) { // eslint-disable-line no-unused-vars
  const latLon = geodesy.OsGridRef.osGridToLatLon(new geodesy.OsGridRef(x, y));
  return {
    type: 'Point',
    coordinates: _.values(_.pick(latLon, 'lon', 'lat')),
  };
}
