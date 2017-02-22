function convertOSGB36ToWGS84Point(x, y) {
  // return geodesy.OsGridRef.osGridToLatLon(new geodesy.OsGridRef(x, y));
  var latLon = geodesy.OsGridRef.osGridToLatLon(new geodesy.OsGridRef(x, y));
  return {
    type: 'Point',
    coordinates: _.values(_.pick(latLon, 'lon', 'lat')),
  };
}
