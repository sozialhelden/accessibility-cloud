/* globals L */

import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import subsManager from '/client/lib/subs-manager';

import { roles } from '/both/api/organization-members/roles';
import { Sources } from '/both/api/sources/sources';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { Organizations } from '/both/api/organizations/organizations';
import { OrganizationMembers } from '/both/api/organization-members/organization-members';
import { SourceAccessRequests } from '/both/api/source-access-requests/source-access-requests';
import { getAccessibleOrganizationIdsForRoles } from '/both/api/organizations/privileges';
import { showNotification, showErrorNotification } from '/client/lib/notifications';

import initializeMap from './initialize-map';
import loadAndRenderMap from './render-map';


Template.sources_show_page_map.onCreated(function created() {
  this.isLoading = new ReactiveVar(true);
  this.loadError = new ReactiveVar();
  this.loadProgress = new ReactiveVar();
  this.isClustering = new ReactiveVar();
  this.isShowingRequestForm = new ReactiveVar(false);

  subsManager.subscribe('sources.requestable.public');
  this.autorun(() => {
    if (Meteor.userId()) {
      subsManager.subscribe('sourceAccessRequests.single', Meteor.userId());
    }
  });
});

const reactiveVariables = [
  'isLoading',
  'loadError',
  'loadProgress',
  'isClustering',
  'isShowingRequestForm',
];

reactiveVariables.forEach(helper =>
  Template.sources_show_page_map.helpers({
    [helper]() { return Template.instance()[helper].get(); },
  })
);

Template.sources_show_page_map.helpers({
  hasAccessToSource() {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });

    if (!source) {
      return false;
    }

    const userId = Meteor.userId();

    return source.isFullyVisibleForUserId(userId) || source.hasRestrictedAccessForUserId(userId);
  },
  canRequestAccessToSource() {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });

    if (!source) {
      return false;
    }

    return !source.isFreelyAccessible && source.isRequestable;
  },
  currentUserHasOrganization() {
    const organizationIds = getAccessibleOrganizationIdsForRoles(
      Meteor.userId(),
      roles.map(role => role.value)
    );
    return organizationIds && organizationIds.length > 0;
  },
  hasAlreadyRequestedAccessToSource() {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });

    if (!source) {
      return false;
    }

    return Boolean(SourceAccessRequests.findOne({
      requesterId: Meteor.userId(),
      sourceId: source._id,
      requestState: 'sent',
    }));
  },
  email() {
    return Meteor.user().emails[0].address;
  },
  requesterOrganizations() {
    return OrganizationMembers
            .find({
              userId: Meteor.userId(),
            })
            .fetch()
            .map(({ organizationId }) => Organizations.findOne(organizationId))
            .filter(Boolean);
  },
});

Template.sources_show_page_map.events({
  'click .js-request-access-to-source': (event, instance) => {
    instance.isShowingRequestForm.set(true);
  },
  'click .js-close-access-request-form': (event, instance) => {
    instance.isShowingRequestForm.set(false);
  },
  'click .js-confirm-access-request': (event, instance) => {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });
    const message = $('.js-access-request-message').val();
    const organizationId = $('.js-requester-organization-menu').val();

    Meteor.call('sourceAccessRequests.askForAccess', {
      requesterId: Meteor.userId(),
      sourceId: source._id,
      message,
      organizationId,
    }, err => {
      if (err) {
        showErrorNotification({ error: err });
        return;
      }

      instance.isShowingRequestForm.set(false);
      showNotification({
        title: 'Request sent',
        message: 'The admin of this source will be notified.',
      });
    });
  },
});

Template.sources_show_page_map.onRendered(function sourcesShowPageOnRendered() {
  const instance = this;
  const map = initializeMap(this);

  this.autorun(() => {
    subsManager.ready();
    FlowRouter.watchPathChange();
    FlowRouter.getQueryParam('limit');
    const sourceId = FlowRouter.getParam('_id');
    if (sourceId) {
      Sources.findOne(sourceId);
    }

    const placeInfoId = FlowRouter.getParam('placeInfoId');
    if (placeInfoId) {
      PlaceInfos.findOne(placeInfoId);
    }

    Tracker.nonreactive(() => {
      loadAndRenderMap(map, instance);
    });
  });
});
