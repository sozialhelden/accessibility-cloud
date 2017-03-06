import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { GlobalStats } from '../global-stats';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { Sources } from '/both/api/sources/sources';
import { Organizations } from '/both/api/organizations/organizations';

export function saveCount({ collection, countName, selector = {} }) {
  check(collection, Mongo.Collection);
  const value = collection.find(selector).count();
  const name = `${collection._name}${countName ? `.${countName}` : ''}.count`;
  GlobalStats.insert({ name, date: new Date(), value });
  console.log(`${value} ${collection._name} in total.`);
}

export function calculateGlobalStats() {
  const sourceIdsWithoutDrafts = Sources
    .find({ isDraft: false }, { fields: { _id: 1 } })
    .fetch()
    .map(source => source._id);

  [
    { collection: Meteor.users },
    { collection: PlaceInfos },
    { collection: Sources },
    { collection: Organizations },
    {
      collection: PlaceInfos,
      countName: 'withoutDrafts',
      selector: { 'properties.sourceId': { $in: sourceIdsWithoutDrafts } },
    },
    {
      collection: Sources,
      countName: 'withoutDrafts',
      selector: { isDraft: false },
    },
  ].forEach(saveCount);
}
