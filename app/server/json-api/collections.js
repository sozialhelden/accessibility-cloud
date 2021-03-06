import { _ } from 'meteor/underscore';
import { dasherize, tableize } from 'inflection';
import { Apps } from '/both/api/apps/apps';
import { AppLinks } from '/both/api/app-links/app-links';
import { Languages } from '/both/api/languages/languages';
import { Licenses } from '/both/api/licenses/licenses';
import { Organizations } from '/both/api/organizations/organizations';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { Sources } from '/both/api/sources/sources';
import { Categories } from '/both/api/categories/categories';
import { EquipmentInfos } from '/both/api/equipment-infos/equipment-infos';
import { EquipmentStatusReports } from '/both/api/equipment-status-reports/equipment-status-reports';
import { Disruptions } from '/both/api/disruptions/disruptions';
import { GlobalStats } from '/both/api/global-stats/global-stats';
import { MappingEvents } from '/both/api/mapping-events/mapping-events';
import { Images } from '/both/api/images/images';

// Limits collections accessible over JSON API to a white list.

const collections = [
  Apps,
  AppLinks,
  Languages,
  Licenses,
  Organizations,
  PlaceInfos,
  SourceImports,
  Sources,
  Categories,
  EquipmentInfos,
  EquipmentStatusReports,
  Disruptions,
  GlobalStats,
  Images,
  MappingEvents,
];

const namesToCollections = _.indexBy(
  collections,
  collection => dasherize(tableize(collection._name)),
);

// Returns a collection for a given route name (e.g. 'place-infos')
export function collectionWithName(name) {
  return namesToCollections[name];
}
