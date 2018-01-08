import { SubsManager } from 'meteor/meteorhacks:subs-manager';

const subsManager = new SubsManager({
  // maximum number of cache subscriptions
  cacheLimit: 1000,
  // any subscription will expire after 60 minutes, if it's not subscribed again
  expireIn: 60,
});

export default subsManager;
