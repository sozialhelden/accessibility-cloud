import { SyncedCron } from 'meteor/percolate:synced-cron';
import flushPurgeQueue from './flushPurgeQueue';

SyncedCron.add({
  name: 'FastlyPurge',

  schedule(parser) {
    return parser.recur().every(1).minute();
  },

  job() {
    flushPurgeQueue();
  },
});
