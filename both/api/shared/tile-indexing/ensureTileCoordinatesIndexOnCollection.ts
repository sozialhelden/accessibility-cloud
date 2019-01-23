import { Mongo } from 'meteor/mongo';
import { get } from 'lodash';

export default function ensureTileCoordinatesIndexOnCollection(collection: Mongo.Collection<any>) {
  const collectionName = get(collection, '_name');
  console.log('Ensure tile coordinates indexing on', collectionName);
  collection._ensureIndex({ tileCoordinates: 1 });
  Array.from({ length: 22 }).forEach((_, i) => {
    collection._ensureIndex(
      {
        [`tileCoordinates.${i}.x`]: 1,
        [`tileCoordinates.${i}.y`]: 1,
        'properties.sourceId': 1,
      },
      { background: true },
    );
  });
}
