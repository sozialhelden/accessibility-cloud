import { Mongo } from 'meteor/mongo';

/**
 * This collection holds surrogate keys that should be purged from Fastly's cache soon.
 * It simply uses the _id for the key.
 */
const fastlyPurgeQueue = new Mongo.Collection<{ _id: string }>('fastlyPurgeQueue');
export default fastlyPurgeQueue;
