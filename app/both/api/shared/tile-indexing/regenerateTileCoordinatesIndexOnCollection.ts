import { Mongo } from 'meteor/mongo';
import { get } from 'lodash';
import generateTileCoordinatesForFeature from './generateTileCoordinatesForFeature';

export default function regenerateTileCoordinatesIndexOnCollection(
  collection: Mongo.Collection<any>,
) {
  const collectionName = get(collection, '_name');
  console.log(`Ensure tile coordinates indexing exists for all ${collectionName}…`);
  const selector = { tileCoordinates: { $exists: false }, geometry: { $exists: true } };
  const options = { fields: { _id: 1, geometry: 1 } };
  const cursor = collection.find(selector, options);
  const count = cursor.count();
  if (count) {
    console.log(`${count} ${collectionName} have no tile index yet, generating…`);
    cursor.forEach((feature: any) => {
      const tileCoordinates = generateTileCoordinatesForFeature(feature);
      if (!tileCoordinates) {
        return;
      }
      collection.update(feature._id, { $set: { tileCoordinates } });
    });
  }
}
