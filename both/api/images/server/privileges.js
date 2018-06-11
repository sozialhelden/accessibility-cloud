import { check } from 'meteor/check';

import { Images } from '../images';

// Deny all client-side updates since we will be using methods to manage this collection
Images.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// TODO image apis are open to everyone - probably should be limited?
Images.visibleSelectorForUserId = (userId) => {
  if (!userId) {
    return null;
  }

  check(userId, String);
  return {};
};

Images.visibleSelectorForAppId = appId => ({});
