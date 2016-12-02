import { Meteor } from 'meteor/meteor';
import { geometrySelector } from './geometry';
import { sourceFilterSelector } from './source-filter.js';
import { paginationOptions } from './pagination';
import { fieldOptions } from './fields';
import { sortOptions } from './sort';
import { _ } from 'meteor/underscore';

export function buildSelectorAndOptions({ req, _id, collection, appId }) {
  let selector = null;

  if (typeof collection.visibleSelectorForAppId === 'function') {
    selector = collection.visibleSelectorForAppId(appId);
  }

  if (!_.isObject(selector)) {
    // This means the collection has no a visibleSelectorForAppId() method defined
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, `${collection._name} collection is accessible over API, but no allowed collection content defined for authenticated app.`);
  }

  selector = {
    $and: [
      selector,
      sourceFilterSelector(req),
      geometrySelector(req),
    ],
  };

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
  Object.assign(options, fieldOptions(req, collection));
  Object.assign(options, sortOptions(req, collection));

  return { selector, options };
}
