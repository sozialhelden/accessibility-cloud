import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';


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

  const selector = {};
  if (typeof foreignCollection.visibleSelectorForUserId === 'function') {
    Object.assign(selector, foreignCollection.visibleSelectorForUserId(userId) || {});
  }
  const foreignIds = _.map(documents, result => result[foreignKey]);
  selector._id = { $in: foreignIds };

  const options = { transform: null };
  // Allow per-user find options, e.g. limited fields dependent on who you are
  if (typeof foreignCollection.findOptionsForUserId === 'function') {
    Object.assign(options, foreignCollection.findOptionsForUserId(userId) || {});
  }

  console.log(
    'Fetching',
    collection._name,
    foreignCollection._name,
    `(${fieldName})`,
    selector,
    'options:',
    options
  );

  const foreignDocuments = foreignCollection.find(selector, options).fetch();
  console.log('Foreign documents', foreignDocuments);
  return {
    foreignDocuments,
    foreignCollectionName: foreignCollection._name,
    foreignCollection,
  };
}

// If you specify a field with a path, the parent documents have to be fetched before the children.
// This function returns an array of paths to fetch in the right order for a given list of paths.
// Example: ['organization', 'source.license'] => ['organization', 'source', 'source.license']

function expandFieldPathsToFetch(fieldPaths) {
  return _.uniq(_.flatten(fieldPaths.map(path => {
    const pathArray = path.split('.');
    return Array.from({ length: path.length }, (v, k) => k)
      .map(length => pathArray.slice(0, length + 1).join('.'));
  }))).sort();
}

// This finds related children documents for a given list of documents.

export function findAllRelatedDocuments({ rootCollection, rootDocuments, req, userId }) {
  check(rootDocuments, [Object]);
  check(rootCollection, Mongo.Collection);
  check(userId, Match.Optional(String));

  const includeChildrenQuery = req.query.includeChildren;
  if (!includeChildrenQuery) {
    return {};
  }

  check(includeChildrenQuery, String);

  const requestedFieldPaths = includeChildrenQuery.split(',');
  if (!requestedFieldPaths.length) {
    return {};
  }
  const fieldPaths = expandFieldPathsToFetch(requestedFieldPaths);
  const resultsByPath = {};
  console.log('Fetching documents for field paths:', fieldPaths);
  fieldPaths.forEach(fieldPath => {
    const [, parentPath, fieldName] =
      fieldPath.match(/(.*)\.([^\.]+$)/) || [null, null, fieldPath];
    const documents = parentPath ? resultsByPath[parentPath].foreignDocuments : rootDocuments;
    const collection = parentPath ? resultsByPath[parentPath].foreignCollection : rootCollection;
    resultsByPath[fieldPath] =
      findRelatedDocuments({
        collection,
        documents,
        fieldName: fieldName || fieldPath,
        userId,
      });
  });
  const results = {};
  Object.keys(resultsByPath).forEach(path => {
    if (!_.include(requestedFieldPaths, path)) {
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
