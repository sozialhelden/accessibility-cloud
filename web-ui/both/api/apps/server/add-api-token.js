import { Random } from 'meteor/random';
import { Apps } from '../apps.js';

// Automatically add API tokens to all new apps that don't have one yet.

Apps.find({ tokenString: { $exists: false } }).observeChanges({
  added(_id) {
    const tokenString = Random.hexString(32);
    Apps.update(_id, { $set: { tokenString } });
  },
});
