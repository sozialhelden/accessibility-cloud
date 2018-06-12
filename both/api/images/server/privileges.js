import { check } from 'meteor/check';

import { Images } from '../images';

// Deny all client-side updates since we will be using methods to manage this collection
Images.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// image apis are open to everyone as currently all images are public in any way
// we will revisit this once our use case changes
Images.visibleSelectorForUserId = (userId) => {
  if (!userId) {
    return null;
  }

  check(userId, String);
  return {};
};

Images.visibleSelectorForAppId = appId => ({});
