import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/stevezhu:lodash';


// For each given document in `documents`, look up the related document that is specified by
// foreign key `fieldName`. Returns all related documents and their collection.

function findRelatedDocuments({ collection, documents, fieldName, appId, userId }) {
  check(documents, [Object]);
  check(collection, Mongo.Collection);
  check(fieldName, String);
  check(appId, Match.Maybe(String));
  check(userId, Match.Maybe(String));
  if (!appId && !userId) {
    throw new Meteor.Error(401, 'Please log in first.');
  }

  const relation = collection.relationships.belongsTo[fieldName];
  if (!relation) {
    throw new Meteor.Error(422, `'${fieldName}' is not a known relation for ${collection._name}.`);
  }
  const { foreignCollection, foreignKey } = relation;

  // Allow limiting visible documents dependent on the requesting app and user
  const visibleSelectors = [];
  if (userId && typeof foreignCollection.visibleSelectorForUserId === 'function') {
    visibleSelectors.push(foreignCollection.visibleSelectorForUserId(userId) || {});
  }
  if (appId && typeof foreignCollection.visibleSelectorForAppId === 'function') {
    visibleSelectors.push(foreignCollection.visibleSelectorForAppId(appId) || {});
  }

  const foreignIds = _.uniq(_.map(documents, doc => _.get(doc, foreignKey)));

  const selector = {
    $and: [
      { $or: visibleSelectors }, // doc must be visible for given user or via given app
      { _id: { $in: foreignIds } }, // doc must be a foreign doc of given docs
    ],
  };

  const options = { transform: null, fields: foreignCollection.publicFields };

  console.log(
    `Including ${collection._name} → ${fieldName} (${foreignCollection._name})`, selector, options
  );

  return {
    foreignDocuments: foreignCollection.find(selector, options).fetch(),
    foreignCollectionName: foreignCollection._name.toLowerCase(),
    foreignCollection,
  };
}


// If you specify a field to fetch using a path, the parent documents have to be fetched before
// the children. E.g. for fetching the license of a source of a place info, the source must be
// fetched before fetching the license.
// This function returns an array of paths to fetch in the right order for a given list of paths.
// Example: ['organization', 'source.license'] => ['organization', 'source', 'source.license']
// The array is sorted by fetch order.

function expandFieldPathsToFetch(fieldPaths) {
  return _.uniq(_.flatten(fieldPaths.map(path => {
    const pathArray = path.split('.');
    return Array.from({ length: path.length }, (v, k) => k)
      .map(length => pathArray.slice(0, length + 1).join('.'));
  }))).sort();
}


// This finds requested related children documents for a given list of documents, indexed by
// collection name and document `_id`.

export function findAllRelatedDocuments({ rootCollection, rootDocuments, req, appId, userId }) {
  check(rootDocuments, [Object]);
  check(rootCollection, Mongo.Collection);
  check(appId, Match.Maybe(String));
  check(userId, Match.Maybe(String));
  if (!appId && !userId) {
    throw new Meteor.Error(401, 'Please log in first.');
  }

  const includeRelatedQuery = req.query.includeRelated;
  check(includeRelatedQuery, Match.Optional(String));
  const requestedFieldPaths = includeRelatedQuery ? includeRelatedQuery.split(',') : [];
  const includePathsByDefault = rootCollection.includePathsByDefault || [];
  const requestedAndDefaultFieldPaths = requestedFieldPaths.concat(includePathsByDefault);

  const resultsByPath = {};
  expandFieldPathsToFetch(requestedAndDefaultFieldPaths).forEach(fieldPath => {
    // Split something like 'grandparent.parent.child' into 'grandparent.parent' and 'child'.
    const [,, parentPath, fieldName] = fieldPath.match(/((.*)\.)?([^\.]+$)/);
    resultsByPath[fieldPath] =
      findRelatedDocuments({
        collection: parentPath ? resultsByPath[parentPath].foreignCollection : rootCollection,
        documents: parentPath ? resultsByPath[parentPath].foreignDocuments : rootDocuments,
        fieldName: fieldName || fieldPath,
        appId,
        userId,
      });
  });

  const results = {};

  Object.keys(resultsByPath).forEach(path => {
    if (!requestedAndDefaultFieldPaths.includes(path)) {
      return;
    }
    const { foreignCollectionName, foreignDocuments } = resultsByPath[path];
    results[foreignCollectionName] = results[foreignCollectionName] || {};
    foreignDocuments.forEach(doc => {
      results[foreignCollectionName][doc._id] = doc;
    });
  });

  return results;
}
