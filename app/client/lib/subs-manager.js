import { SubsManager } from 'meteor/meteorhacks:subs-manager';

const subsManager = new SubsManager({
  // maximum number of cache subscriptions
  cacheLimit: 5000,
  // any subscription will expire after 5 hours, if it's not subscribed again
  expireIn: 300,
});

export default subsManager;
