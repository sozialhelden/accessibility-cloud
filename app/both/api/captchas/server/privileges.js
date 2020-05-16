import { Captchas } from '../captchas';

// Deny all client-side updates since we will be using methods to manage this collection
Captchas.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
