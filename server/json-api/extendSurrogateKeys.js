import get from 'lodash/get';

// Collect ids found in result documents and add them to the cache surrogate key.
// This allows use an _id of a changed document to purge all cached HTTP responses that contain
// the document with the given _id.

export default function extendSurrogateKeys({ collection, documents, related, surrogateKeys }) {
  documents.forEach((doc) => {
    // Add ids of the returned documents themselves
    surrogateKeys.push(doc._id);

    // Add collection-specific surrogate keys
    if (typeof collection.surrogateKeysForDocument === 'function') {
      collection.surrogateKeysForDocument(doc).forEach(key => surrogateKeys.push(key));
    }
  });

  if (typeof collection.relationships === 'object') {
    if (typeof collection.relationships.hasMany === 'object') {
      Object.keys(collection.relationships.hasMany).forEach((hasManyRelationName) => {
        documents.forEach((doc) => {
          // Add ids of hasMany-related documents that might be cached inside documents
          const relatedDocuments = doc[hasManyRelationName] || get(doc, ['properties', hasManyRelationName]);
          if (typeof relatedDocuments === 'object') {
            const ids = Object.keys(relatedDocuments);
            ids.forEach(_id => surrogateKeys.push(_id));
          }
        });
      });
    }
  }

  // Add ids from non-cached related documents in the response
  if (typeof related === 'object') {
    Object.keys(related).forEach((relatedCollectionName) => {
      const idsToDocuments = related[relatedCollectionName];
      if (typeof idsToDocuments === 'object') {
        const ids = Object.keys(idsToDocuments);
        ids.forEach(_id => surrogateKeys.push(_id));
      }
    });
  }
}
