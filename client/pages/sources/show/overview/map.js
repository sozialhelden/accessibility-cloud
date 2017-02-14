/* globals L */

import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { getCurrentPlaceInfo } from './get-current-place-info';
import { Sources } from '/both/api/sources/sources.js';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import { SourceAccessRequests } from '/both/api/source-access-requests/source-access-requests.js';
import subsManager from '/client/lib/subs-manager';
import { showNotification, showErrorNotification } from '/client/lib/notifications';
import initializeMap from './initialize-map';
import renderMap, { resetMarkers } from './render-map';

function centerOnCurrentPlace(map) {
  const place = getCurrentPlaceInfo();
  if (place) {
    map.setView(place.geometry.coordinates.reverse(), 18);
  }
}

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

  this.autorun(() => renderMap(map, instance));
  this.autorun(() => centerOnCurrentPlace(map));
});
