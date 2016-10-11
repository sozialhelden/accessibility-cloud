import { Meteor } from 'meteor/meteor';
import { geometrySelector } from './geometry';

export function buildSelector({ req, _id, collection, userId }) {
  let selector = null;

  if (typeof collection.visibleSelectorFor === 'function') {
    selector = collection.visibleSelectorFor(userId);
  }

  if (!selector) {
    // This means the collection has to have a visibleSelectorFor() method defined
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'No allowed collection content defined.');
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

  const options = { transform: null };
  if (typeof collection.findOptionsFor === 'function') {
    Object.assign(options, collection.findOptionsFor(userId) || {});
  }

  return { selector, options };
}
