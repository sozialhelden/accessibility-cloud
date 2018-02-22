import omit from 'lodash/omit';
import { EJSON } from 'meteor/ejson';
import { Meteor } from 'meteor/meteor';
import extendSurrogateKeys from '../extendSurrogateKeys';
import { findAllRelatedDocuments } from '../related-objects';
import { buildSelectorAndOptions } from '../selectors/build-selector';

// Handle a GET HTTP request.

export function GET({ req, collection, _id, appId, userId, surrogateKeys }) {
  if (!collection) {
    throw new Meteor.Error(404, 'Collection not found.');
  }

  const { selector, options } = buildSelectorAndOptions({ req, collection, _id, appId, userId, surrogateKeys });

  console.log(EJSON.stringify({ selector, options }));

  if (_id) {
    // Return single document
    const result = collection.findOne(selector, options);
    if (!result) {
      throw new Meteor.Error(404, 'Resource not found.');
    }
    const related = findAllRelatedDocuments({
      req,
      appId,
      userId,
      rootCollection: collection,
      rootDocuments: [result],
      surrogateKeys,
    });

    extendSurrogateKeys({ collection, documents: [result], related, surrogateKeys });

    if (typeof collection.wrapDocumentAPIResponse === 'function') {
      return collection.wrapDocumentAPIResponse({ result, req, _id, related, surrogateKeys });
    }
    return result;
  }

  // Return array of documents
  const resultsCount = collection.find(selector, omit(options, 'skip', 'limit')).count();
  const results = collection.find(selector, options).fetch();

  const related = findAllRelatedDocuments({
    req,
    appId,
    userId,
    rootCollection: collection,
    rootDocuments: results,
    surrogateKeys,
  });

  extendSurrogateKeys({ collection, documents: results, related, surrogateKeys });

  if (typeof collection.wrapCollectionAPIResponse === 'function') {
    return collection.wrapCollectionAPIResponse({ results, req, _id, related, resultsCount });
  }

  return {
    count: results.length,
    totalCount: resultsCount,
    related,
    results,
  };
}
