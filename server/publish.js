import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';

export function publishAndLog(name, publishFunction) {
  console.log('Publishing', name, '…');
  Meteor.publish(name, publishFunction);
}


// Publishes all public fields for a collection. You can optionally supply function to specify
// which documents' public fields should be published as third parameter. This function is called
// with a userId argument and should return a selector.
// The publication ensures only documents that are visible for the given user are published. To
// specify what's visible, implement `visibleSelectorForUserId` in your collection.

export function publishPublicFields(
  publicationName,
  collection,
  selectorFunction = () => ({}),
  options = {},
  visibleSelectorOrNull = null,
) {
  check(publicationName, String);
  check(collection, Mongo.Collection);
  const fullPublicationName = `${publicationName}.public`;
  publishAndLog(
    fullPublicationName,
    function publish() {
      this.autorun(() => {
        const givenSelector = selectorFunction(this.userId);
        if (!Match.test(givenSelector, Match.ObjectIncluding({}))) {
          console.log('Erroneous selector given in', publicationName, 'publication:', givenSelector);
          return [];
        }
        const visibleSelector = visibleSelectorOrNull || collection.visibleSelectorForUserId(this.userId);
        const selector = { $and: _.compact([givenSelector, visibleSelector]) };
        return collection.find(
          selector,
          _.extend({}, options, { fields: collection.publicFields }),
        );
      });
    },
  );
}


// Like publishPublicFields, but publishes only private fields.

export function publishPrivateFields(
  publicationName,
  collection,
  selectorFunction = () => ({}),
  options = {},
) {
  check(publicationName, String);
  check(collection, Mongo.Collection);
  check(selectorFunction, Function);
  const fullPublicationName = `${publicationName}.private`;
  publishAndLog(
    fullPublicationName,
    function publish() {
      this.autorun(() => {
        const givenSelector = selectorFunction(this.userId);
        if (!Match.test(givenSelector, Match.ObjectIncluding({}))) {
          console.log('Erroneous selector given in', publicationName, 'publication:', givenSelector);
          return [];
        }
        const visibleSelector = collection.visibleSelectorForUserId(this.userId);
        const selector = { $and: _.compact([givenSelector, visibleSelector]) };
        return collection.find(
          selector,
          _.extend({}, options, { fields: collection.privateFields }),
        );
      });
    }
  );
}
