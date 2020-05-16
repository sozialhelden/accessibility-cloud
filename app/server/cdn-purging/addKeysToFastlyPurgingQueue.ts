import { uniq } from 'lodash';
import fastlyPurgeQueue from './fastlyPurgeQueue';

export default function addKeysToFastlyPurgingQueue(keys: string[]) {
  uniq(keys)
    // tslint:disable-next-line:variable-name
    .forEach(_id => fastlyPurgeQueue.upsert({ _id }, { $set: { _id } }));
}
