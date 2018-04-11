import { Meteor } from 'meteor/meteor';

// Handle a POST HTTP request.

export function POST({ req, res, collection, appId, userId }) {
  if (!collection) {
    throw new Meteor.Error(404, 'Collection not found.');
  }

  const doc = req.body;
  console.log('POST', { doc, collectionName: collection._name, appId, userId });

  if (!collection.isInsertableBy) {
    // To make the collection accessible as a developer, implement the `isInsertableBy` method.
    throw new Meteor.Error(404, `${collection._name} cannot be inserted over the API yet. If you need this, feel free to contact us at support@accessibility.cloud!`);
  }

  collection.schema.clean(doc);
  collection.schema.validate(doc);

  if (!collection.isInsertableBy({ userId, appId, doc })) {
    throw new Meteor.Error(401, 'Not authorized.');
  }

  const _id = collection.insert(doc);

  if (_id) {
    if (typeof collection.afterInsertViaAPI === 'function') {
      collection.afterInsertViaAPI(Object.assign({}, doc, { _id }));
    }
    res.statusCode = 204;
    return { _id };
  }

  res.statusCode = 500;
  return { error: 'Unknown error. Document was not inserted, but no error was thrown.' };
}
