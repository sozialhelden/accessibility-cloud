// @flow
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { isAdmin } from '../both/lib/is-admin';


export default function purgeOnFastly(surrogateKeys: string[]): ?HTTP.HTTPResponse {
  if (!surrogateKeys) return null;
  if (!surrogateKeys.length) return null;

  const { fastlyKey, serviceId } = Meteor.settings.fastly || {};

  if (!fastlyKey) {
    console.log('Did not purge', surrogateKeys, 'on Fastly because no `fastlyKey` is set.');
    return null;
  }

  if (!serviceId) {
    console.log('Did not purge', surrogateKeys, 'on Fastly because no `serviceId` is set.');
    return null;
  }

  const url = `https://api.fastly.com/service/${serviceId}/purge`;
  const options = {
    headers: {
      'Fastly-Key': fastlyKey,
      Accept: 'application/json',
      'Surrogate-Key': surrogateKeys.join(' '),
    },
  };

  const result = HTTP.post(url, options);
  if (result.statusCode === 200) {
    console.log(`Purged ${surrogateKeys.length} keys on Fastly.`);
  } else {
    console.log('Error while processing purge request for', surrogateKeys, 'on Fastly, result:', result);
  }

  return result;
}


Meteor.methods({
  'fastly.purge'(keys) {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }

    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'Not authorized');
    }

    this.unblock();

    check(keys, [String]);

    return purgeOnFastly(keys);
  },
});

const FastlyKeysToPurge = Mongo.Collection('FastlyKeysToPurge');

export function addKeysToFastlyPurgingQueue(keys) {
  const keyDocs = keys.map(_id => ({ _id }));
  FastlyKeysToPurge.rawCollection.insertMany(keyDocs, { ordered: false });
}

function purgeImportedDocsOnFastly() {
  console.log('Purging keys on fastly…');
  let idBatch = [];
  const purge = () => {
    if (idBatch.length) {
      purgeOnFastly(idBatch);
      idBatch.forEach(_id => FastlyKeysToPurge.remove(_id));
      idBatch = [];
    }
  };
  FastlyKeysToPurge
    .find()
    .forEach((doc) => {
      idBatch.push(doc._id);
      if (idBatch.length === 128) {
        purge();
      }
    });
  purge();
}

SyncedCron.add({
  name: 'FastlyPurge',

  schedule(parser) {
    return parser.recur().every(1).minute();
  },

  job() {
    purgeImportedDocsOnFastly();
  },
});
