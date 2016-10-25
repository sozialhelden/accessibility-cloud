import { Meteor } from 'meteor/meteor';
import { buildSelectorAndOptions } from '../selectors/build-selector';
import { EJSON } from 'meteor/ejson';

// Handle a GET HTTP request. The following variables are available inside the function:
//  }

export function GET({ req, collection, _id, userId }) {
  if (!collection) {
    throw new Meteor.Error(404, 'Collection not found.');
  }

  const { selector, options } = buildSelectorAndOptions({ req, collection, _id, userId });

  console.log(EJSON.stringify({ selector, options }));

  if (_id) {
    // Return single document
    return collection.findOne(selector, options);
  }

  // Return array of documents
  const results = collection.find(selector, options).fetch();

  if (typeof collection.wrapAPIResponse === 'function') {
    return collection.wrapAPIResponse({ results, req, _id, userId });
  }

  return {
    count: results.length,
    results,
  };
}
