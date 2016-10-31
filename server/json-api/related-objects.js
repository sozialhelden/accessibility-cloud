import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';


function findRelatedDocumentsForFieldName({ documents, collection, fieldName, userId }) {
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
  // Allow per-user find options, e.g. limited field dependent
  if (typeof foreignCollection.findOptionsForUserId === 'function') {
    Object.assign(options, foreignCollection.findOptionsForUserId(userId) || {});
  }

  console.log('Foreign document selector:', selector, 'options:', options);

  const foreignDocuments = foreignCollection.find(selector, options).fetch();
  console.log('Foreign documents', foreignDocuments);
  return { foreignCollection, foreignDocuments };
}


// This finds related children documents for a given list of documents.

export function findRelatedDocuments({ documents, req, collection, userId }) {
  check(documents, [Object]);
  check(collection, Mongo.Collection);
  check(userId, Match.Optional(String));

  const includeChildrenQuery = req.query.includeChildren;
  if (!includeChildrenQuery) {
    return {};
  }

  check(includeChildrenQuery, String);

  const fieldNames = includeChildrenQuery.split(',');
  if (!fieldNames.length) {
    return {};
  }

  const relatedDocuments = {};

  fieldNames.forEach(fieldName => {
    const options = { documents, fieldName, collection, userId };
    const { foreignCollection, foreignDocuments } = findRelatedDocumentsForFieldName(options);
    relatedDocuments[foreignCollection._name] = relatedDocuments[foreignCollection._name] || {};
    relatedDocuments[foreignCollection._name] = _.indexBy(foreignDocuments, '_id');
  });

  return relatedDocuments;
}
