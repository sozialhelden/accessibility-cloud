import { SourceImports } from '../source-imports';
import { _ } from 'lodash';

const attributeDistributionCache = {};

SourceImports.helpers({
  getCachedAttributeDistribution() {
    const cache = attributeDistributionCache;
    cache[this._id] = cache[this._id] || this.getAttributeDistribution();
    return attributeDistributionCache[this._id];
  },
  getAttributeDistribution() {
    return this.attributeDistribution && JSON.parse(this.attributeDistribution);
  },
  mostFrequentCategoryNamesToPlaceCounts(limit = 10) {
    const attributeDistribution = this.getCachedAttributeDistribution();
    if (!attributeDistribution) return [];
    const categoryNamesToCounts = attributeDistribution.properties.properties.category;
    if (!categoryNamesToCounts) return [];
    const categoryNames = Object.keys(categoryNamesToCounts);
    const countForCategoryName = (name) => categoryNamesToCounts[name];
    return _.sortBy(categoryNames, countForCategoryName)
      .reverse()
      .slice(0, limit)
      .map(name => ({ name, count: countForCategoryName(name) }));
  },
  placeCountsByAccessibilityType() {
    const attributeDistribution = this.getCachedAttributeDistribution();
    if (!attributeDistribution) { return []; }
    const source = this.getSource();
    if (!source) {
      return [];
    }
    const totalCount = this.getSource().placeInfoCount;
    const typeNamesToCounts =
      _.get(attributeDistribution, 'properties.properties.accessibility.accessibleWith');
    return Object.keys(typeNamesToCounts || {})
      .map(name => ({
        name,
        false: typeNamesToCounts[name].false,
        true: typeNamesToCounts[name].true,
        unknown: totalCount - typeNamesToCounts[name].true - typeNamesToCounts[name].false,
      }));
  },
});
