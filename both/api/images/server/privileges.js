import { Images } from '../images';

// Deny all client-side updates since we will be using methods to manage this collection
Images.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
