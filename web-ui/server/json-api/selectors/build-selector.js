import { Meteor } from 'meteor/meteor';
import { geometrySelector } from './geometry';
import { paginationOptions } from './pagination';

export function buildSelectorAndOptions({ req, _id, collection, userId }) {
  let selector = null;

  if (typeof collection.visibleSelectorForUserId === 'function') {
    selector = collection.visibleSelectorForUserId(userId);
  }

  if (!selector) {
    // This means the collection has to have a visibleSelectorForUserIdUserIdUserId() method defined
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'Collection is accessible over API, but no allowed collection content defined for authenticated user.');
  }

  Object.assign(selector, geometrySelector(req));

  if (_id) {
    selector = {
      $and: [
        { _id },
        selector,
      ],
    };
  }

  // Don't return objects transformed by transform function defined on collection.
  // This means returned objects don't have the helper methods you defined with
  // MyCollection.helpers().
  const options = { transform: null };

  Object.assign(options, paginationOptions(req));

  // Allow per-user find options, e.g. limited field dependent
  if (typeof collection.findOptionsForUserId === 'function') {
    Object.assign(options, collection.findOptionsForUserId(userId) || {});
  }


  return { selector, options };
}
