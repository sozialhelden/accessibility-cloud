import { uniq } from 'lodash';
import fastlyPurgeQueue from './fastlyPurgeQueue';

export default function addKeysToFastlyPurgingQueue(keys) {
  uniq(keys)
    .forEach(_id => fastlyPurgeQueue.upsert({ _id }, { $set: { _id } }));
}
