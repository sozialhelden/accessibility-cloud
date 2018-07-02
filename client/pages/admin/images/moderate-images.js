import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Images, DefaultModerationFilter } from '../../../../both/api/images/images';
import subsManager from '../../../lib/subs-manager';

Template.images_moderate_page.onCreated(function organizationsShowPageOnCreated() {
  subsManager.subscribe('images.public');
});


const readParams = () => {
  const withIp = FlowRouter.getQueryParam('withIp');
  const isReported = FlowRouter.getQueryParam('isReported') === 'true';
  const timestampFrom = parseInt(FlowRouter.getQueryParam('timestampFrom'), 10) || null;
  const timestampTo = parseInt(FlowRouter.getQueryParam('timestampTo'), 10) || null;
  const sortBy = FlowRouter.getQueryParam('sortBy');
  const skip = parseInt(FlowRouter.getQueryParam('skip'), 10) || 0;
  const limit = parseInt(FlowRouter.getQueryParam('limit'), 10) || 30;
  const sortByTimestamp = sortBy === 'oldest' ? 1 : -1;

  return {
    withIp,
    isReported,
    timestampFrom,
    timestampTo,
    sortBy,
    skip,
    limit,
    sortByTimestamp,
  };
};

const buildMongoQuery = (params) => {
  const filter = Object.assign({}, DefaultModerationFilter);
  if (params.isReported) {
    filter.reports = { $exists: true, $ne: [] };
  }
  if (params.withIp) {
    filter.hashedIp = params.withIp;
  }
  if (params.timestampFrom || params.timestampTo) {
    filter.timestamp = {};
    if (params.timestampFrom) {
      filter.timestamp.$gte = new Date(params.timestampFrom);
    }
    if (params.timestampTo) {
      filter.timestamp.$lte = new Date(params.timestampTo);
    }
  }

  const options = {
    sort: { timestamp: params.sortByTimestamp },
    skip: params.skip,
    limit: params.limit,
  };

  return { filter, options };
};

Template.images_moderate_page.helpers({
  options() {
    const params = readParams();

    return {
      filterReported: params.isReported,
      timestampFrom: params.timestampFrom ? new Date(params.timestampFrom).toISOString() : null,
      timestampTo: params.timestampTo ? new Date(params.timestampTo).toISOString() : null,
      sortByOldest: params.sortBy === 'oldest',
      sortByNewest: params.sortBy !== 'oldest',
      withIp: params.withIp ? params.withIp.substring(0, 8) : null,
    };
  },
  paging() {
    const params = readParams();
    const { filter } = buildMongoQuery(params);

    const count = Images.find(filter).count();

    return {
      start: params.skip + 1,
      end: Math.min(params.skip + params.limit, count),
      count,
      showPrev: params.skip > 0,
      showNext: (params.skip + params.limit) < count,
    };
  },
  images() {
    const params = readParams();
    const { filter, options } = buildMongoQuery(params);

    return Images.find(
      filter,
      options,
    );
  },
  truncate(str) {
    return str.substring(0, 8);
  },
});

// sorting & filtering
Template.images_moderate_page.events({
  'click .js-filter-by-reported'(event) {
    FlowRouter.withReplaceState(() => {
      const reported = FlowRouter.getQueryParam('isReported') === 'true';
      FlowRouter.setQueryParams({ isReported: reported ? undefined : 'true' });
    });
    event.preventDefault();
  },
  'click .js-filter-by-last-week'(event) {
    FlowRouter.withReplaceState(() => {
      const lastWeek = new Date(Date.now() - (1000 * 60 * 60 * 24 * 7)).getTime();
      FlowRouter.setQueryParams({ timestampFrom: lastWeek, timestampTo: undefined });
    });
    event.preventDefault();
  },
  'click .js-sort-by-newest'(event) {
    FlowRouter.withReplaceState(() =>
      FlowRouter.setQueryParams({ sortBy: 'newest' }),
    );
    event.preventDefault();
  },
  'click .js-sort-by-oldest'(event) {
    FlowRouter.withReplaceState(() =>
      FlowRouter.setQueryParams({ sortBy: 'oldest' }),
    );
    event.preventDefault();
  },
  'click .js-reset-ip-filter'(event) {
    FlowRouter.withReplaceState(() =>
      FlowRouter.setQueryParams({ withIp: undefined }),
    );
    event.preventDefault();
  },
  'click .js-reset-timestamp-from'(event) {
    FlowRouter.withReplaceState(() =>
      FlowRouter.setQueryParams({ timestampFrom: undefined }),
    );
    event.preventDefault();
  },
  'click .js-reset-timestamp-to'(event) {
    FlowRouter.withReplaceState(() =>
      FlowRouter.setQueryParams({ timestampTo: undefined }),
    );
    event.preventDefault();
  },
});

// paging actions
Template.images_moderate_page.events({
  'click .js-prev-page'(event) {
    const skip = parseInt(FlowRouter.getQueryParam('skip'), 10) || 0;
    const limit = parseInt(FlowRouter.getQueryParam('limit'), 10) || 30;
    FlowRouter.withReplaceState(() =>
      FlowRouter.setQueryParams({ skip: Math.max(0, skip - limit) }),
    );
    event.preventDefault();
  },
  'click .js-next-page'(event) {
    const skip = parseInt(FlowRouter.getQueryParam('skip'), 10) || 0;
    const limit = parseInt(FlowRouter.getQueryParam('limit'), 10) || 30;
    FlowRouter.withReplaceState(() =>
      FlowRouter.setQueryParams({ skip: skip + limit }),
    );
    event.preventDefault();
  },
});


// image actions
Template.images_moderate_page.events({
  'click .js-filter-by-image-ip'(event) {
    FlowRouter.withReplaceState(() => {
      const isThisIpFilter = FlowRouter.getQueryParam('withIp') === this.hashedIp;
      FlowRouter.setQueryParams({ withIp: isThisIpFilter ? undefined : this.hashedIp });
    });
    event.preventDefault();
  },
  'click .js-approve-image'(event) {
    Meteor.call('images.approve', this._id, (err, result) => {
      $('.js-error').html(err ? JSON.stringify(err, true, 2) : '');
      $('.js-result').html(result || '');
    });
    event.preventDefault();
  },
  'click .js-reject-image'(event) {
    if (confirm('Do you really want to reject this image?')) {
      Meteor.call('images.reject', this._id, (err, result) => {
        $('.js-error').html(err ? JSON.stringify(err, true, 2) : '');
        $('.js-result').html(result || '');
      });
    }
    event.preventDefault();
  },
});
