import { Meteor } from 'meteor/meteor';
import { paginationOptions } from './pagination';
import { fieldOptions } from './fields';
import { sortOptions } from './sort';
import { _ } from 'meteor/underscore';

const noContentDefinedMessage = collection =>
  `${collection._name} collection is accessible over API, but no allowed collection content defined for authenticated app / user.`;

export function buildSelectorAndOptions({ req, surrogateKeys, _id, collection, appId, userId }) {
  const selectors = [];

  if (!collection.apiParameterizedSelector) {
    // To make the collection accessible as a developer, implement the `apiParameterizedSelector` method.
    throw new Meteor.Error(404, `${collection._name} collection is not accessible over API yet. If you need access to it, you can contact us at support@accessibility.cloud.`);
  }

  if (userId && typeof collection.visibleSelectorForUserId === 'function') {
    selectors.push(collection.visibleSelectorForUserId(userId));
  }

  if (appId && typeof collection.visibleSelectorForAppId === 'function') {
    selectors.push(collection.visibleSelectorForAppId(appId));
  }

  if (!selectors.length) {
    // This means the collection has no visibleSelectorFor[App|User]Id() method defined
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, noContentDefinedMessage(collection));
  }

  const visibleContentSelector = (selectors.length === 1) ? selectors[0] : { $or: selectors };

  let selector = collection.apiParameterizedSelector({ visibleContentSelector, req, _id, surrogateKeys });

  if (_id) {
    selector = {
      $and: [
        { _id },
        selector,
      ],
    };
  } else {
    if (selector.$and && selector.$and.length === 0) {
      console.log('Selector:', selector);
      throw new Meteor.Error(401, noContentDefinedMessage(collection));
    }
  }

  // Don't return objects transformed by transform function defined on collection.
  // This means returned objects don't have the helper methods you defined with
  // MyCollection.helpers().
  const options = { transform: null };

  Object.assign(options, paginationOptions(req));
  Object.assign(options, fieldOptions(req, collection));
  Object.assign(options, sortOptions(req, collection));

  return { selector, options };
}
