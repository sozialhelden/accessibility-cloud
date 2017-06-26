import { _ } from 'meteor/underscore';
import { s } from 'meteor/underscorestring:underscore.string';

import { Apps } from '/both/api/apps/apps';
import { Languages } from '/both/api/languages/languages';
import { Licenses } from '/both/api/licenses/licenses';
import { Organizations } from '/both/api/organizations/organizations';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { Sources } from '/both/api/sources/sources';
import { Categories } from '/both/api/categories/categories';

// Limits collections accessible over JSON API to a white list.

const collections = [
  Apps,
  Languages,
  Licenses,
  Organizations,
  PlaceInfos,
  SourceImports,
  Sources,
  Categories,
];

const namesToCollections = _.indexBy(
  collections,
  collection => s.slugify(s.humanize(collection._name))
);

// Returns a collection for a given route name (e.g. 'place-infos')
export function collectionWithName(name) {
  return namesToCollections[name];
}
