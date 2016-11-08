import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/stevezhu:lodash';


// For each given document in `documents`, look up the related document that is specified by
// foreign key `fieldName`. Returns all related documents and their collection.

function findRelatedDocuments({ collection, documents, fieldName, userId }) {
  check(documents, [Object]);
  check(collection, Mongo.Collection);
  check(fieldName, String);
  check(userId, Match.Optional(String));

  const relation = collection.relationships.belongsTo[fieldName];
  if (!relation) {
    throw new Meteor.Error(422, `'${fieldName}' is not a known relation for ${collection._name}.`);
  }
  const { foreignCollection, foreignKey } = relation;

  // Allow limiting visible documents dependent on who you are
  const visibleSelector = {};
  if (typeof foreignCollection.visibleSelectorForUserId === 'function') {
    Object.assign(visibleSelector, foreignCollection.visibleSelectorForUserId(userId) || {});
  }
  const foreignIds = _.uniq(_.map(documents, doc => _.get(doc, foreignKey)));
  const selector = { $and: [visibleSelector, { _id: { $in: foreignIds } }] };

  // Allow per-user find options, e.g. limited fields dependent on who you are
  const options = { transform: null, fields: foreignCollection.publicFields };
  // const options = { transform: null };
  if (typeof foreignCollection.findOptionsForUserId === 'function') {
    Object.assign(options, foreignCollection.findOptionsForUserId(userId) || {});
  }

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

export function findAllRelatedDocuments({ rootCollection, rootDocuments, req, userId }) {
  check(rootDocuments, [Object]);
  check(rootCollection, Mongo.Collection);
  check(userId, Match.Optional(String));

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
