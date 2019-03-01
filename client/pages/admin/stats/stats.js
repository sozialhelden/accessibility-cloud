import { Template } from 'meteor/templating';
import { GlobalAttributeStats } from '../../../../both/api/global-attribute-stats/global-attribute-stats';

let attributeDistributionCache = {};

function getAttributeDistributionString() {
  const options = { sort: { date: -1 } };
  const statsDocument = GlobalAttributeStats.findOne({}, options);
  return statsDocument &&
    statsDocument.attributeDistribution &&
    JSON.parse(this.attributeDistribution).properties;
}

// eslint-disable-next-line meteor/template-names
Template.admin_stats_page.helpers({
  getCachedAttributeDistribution() {
    attributeDistributionCache = attributeDistributionCache || getAttributeDistributionString();
    return attributeDistributionCache;
  },
});
