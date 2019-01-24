import { uniq } from 'lodash';
import fastlyPurgeQueue from './fastlyPurgeQueue';

export default function addKeysToFastlyPurgingQueue(keys) {
  const keyDocs = uniq(keys).map(_id => ({ _id }));
  fastlyPurgeQueue.rawCollection.upsertMany(keyDocs, { ordered: false });
}
