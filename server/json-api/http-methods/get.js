import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { buildSelectorAndOptions } from '../selectors/build-selector';
import { findAllRelatedDocuments } from '../related-objects';

// Handle a GET HTTP request. The following variables are available inside the function:
//  }

export function GET({ req, collection, _id, appId, userId }) {
  if (!collection) {
    throw new Meteor.Error(404, 'Collection not found.');
  }

  const { selector, options } = buildSelectorAndOptions({ req, collection, _id, appId, userId });

  console.log(EJSON.stringify({ selector, options }));

  if (_id) {
    // Return single document
    return collection.findOne(selector, options);
  }

  // Return array of documents
  const results = collection.find(selector, options).fetch();

  const related = findAllRelatedDocuments({
    req,
    appId,
    userId,
    rootCollection: collection,
    rootDocuments: results,
  });

  if (typeof collection.wrapAPIResponse === 'function') {
    return collection.wrapAPIResponse({ results, req, _id, related });
  }

  return {
    count: results.length,
    related,
    results,
  };
}
