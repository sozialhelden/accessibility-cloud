import debounce from 'lodash/debounce';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { GlobalStats } from '../global-stats';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { EquipmentInfos } from '/both/api/equipment-infos/equipment-infos';
import { Disruptions } from '/both/api/disruptions/disruptions';
import { Sources } from '/both/api/sources/sources';
import { Organizations } from '/both/api/organizations/organizations';


const MinimalTimeBetweenStatsCalculations = 60000;

export function saveCount({ collection, countName, selector = {} }) {
  check(collection, Mongo.Collection);
  const value = collection.find(selector).count();
  const name = `${collection._name}${countName ? `.${countName}` : ''}.count`;
  GlobalStats.insert({ name, date: new Date(), value });
  console.log(`${value} ${collection._name} (${countName}) in total.`);
}

export const calculateGlobalStats = debounce(Meteor.bindEnvironment(() => {
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
      collection: EquipmentInfos,
      countName: 'withoutDrafts',
      selector: { 'properties.sourceId': { $in: sourceIdsWithoutDrafts } },
    },
    {
      collection: EquipmentInfos,
      countName: 'withoutDrafts.onlyEscalators',
      selector: { 'properties.sourceId': { $in: sourceIdsWithoutDrafts }, 'properties.category': 'escalator' },
    },
    {
      collection: EquipmentInfos,
      countName: 'withoutDrafts.onlyBrokenEscalators',
      selector: { 'properties.sourceId': { $in: sourceIdsWithoutDrafts }, 'properties.category': 'escalator', 'properties.isWorking': false },
    },
    {
      collection: EquipmentInfos,
      countName: 'withoutDrafts.onlyElevators',
      selector: { 'properties.sourceId': { $in: sourceIdsWithoutDrafts }, 'properties.category': 'elevator' },
    },
    {
      collection: EquipmentInfos,
      countName: 'withoutDrafts.onlyBrokenElevators',
      selector: { 'properties.sourceId': { $in: sourceIdsWithoutDrafts }, 'properties.category': 'elevator', 'properties.isWorking': false },
    },
    {
      collection: Disruptions,
      countName: 'withoutDrafts',
      selector: { 'properties.sourceId': { $in: sourceIdsWithoutDrafts } },
    },
    {
      collection: Disruptions,
      countName: 'withoutDrafts.onlyEscalators',
      selector: { 'properties.sourceId': { $in: sourceIdsWithoutDrafts }, 'properties.category': 'escalator' },
    },
    {
      collection: Disruptions,
      countName: 'withoutDrafts.onlyElevators',
      selector: { 'properties.sourceId': { $in: sourceIdsWithoutDrafts }, 'properties.category': 'elevator' },
    },
    {
      collection: Sources,
      countName: 'withoutDrafts',
      selector: { isDraft: false },
    },
  ].forEach(saveCount);
}), MinimalTimeBetweenStatsCalculations);
