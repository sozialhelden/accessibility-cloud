import { isAdmin } from '../../../lib/is-admin';

import { Images } from '../images';

Images.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

Images.helpers({
  editableBy: isAdmin,
});

Images.visibleSelectorForUserId = (userId) => {
  if (!userId || !isAdmin(userId)) {
    return null;
  }

  return {};
};

// image apis are open to everyone as currently all images are public in any way
// we will revisit this once our use case changes
Images.visibleSelectorForAppId = () => ({});
