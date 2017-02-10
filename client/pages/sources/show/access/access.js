import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceAccessRequests } from '/both/api/source-access-requests/source-access-requests.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import { $ } from 'meteor/jquery';
import subsManager from '/client/lib/subs-manager';
import { showNotification, showErrorNotification } from '/client/lib/notifications';

Template.sources_show_access_page.onCreated(() => {
  subsManager.subscribe('sourceImports.public');
  subsManager.subscribe('sourceImports.private');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('sources.private');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('users.public');
  subsManager.subscribe('sourceAccessRequests.forSource', FlowRouter.getParam('_id'));

  window.Sources = Sources; // FIXME: we don't need this, it's only for debugging
});


const helpers = {
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },
  organizations() {
    return Organizations.find({});
  },
  checkedIfOrganizationHasAccess(organizationId) {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });
    if (source.accessRestrictedTo && source.accessRestrictedTo.indexOf(organizationId) !== -1) {
      return 'checked';
    }
    return '';
  },
  checkedIfAccessToSourceCanBeRequested() {
    const source = Sources.findOne(FlowRouter.getParam('_id'));

    return source && source.isRequestable ? 'checked' : '';
  },
  selectedIfAccessibleToAll() {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });
    if (source.isFreelyAccessible) {
      return 'selected';
    }
    return '';
  },
  pendingRequests() {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });
    const requestsArray = SourceAccessRequests.find({
      sourceId: source._id,
      requestState: 'sent',
    }).fetch();

    return requestsArray.map(request => {
      const requester = Meteor.users.findOne(request.requesterId);
      const requesterOrganization = Organizations.findOne(request.organizationId).name;

      return Object.assign({}, request, {
        email: requester.emails[0].address,
        requesterOrganization,
      });
    });
  },
};


Template.sources_show_access_page.events({
  'change select': (event) => {
    event.preventDefault();

    const isFreelyAccessible = event.currentTarget.value === 'isFreelyAccessible';
    const _id = FlowRouter.getParam('_id');
    Sources.update(_id, {
      $set: { isFreelyAccessible },
    });
  },
  'change input[type=checkbox]': () => {
    $('button.js-save').removeClass('unchanged');
  },
  'click button.js-save': (event) => {
    event.preventDefault();

    const _id = FlowRouter.getParam('_id');
    const idsOfOrganizationsWithAccess = [];

    $('ul.access-list input[type=checkbox]').each((index, element) => {
      if (element.checked) {
        idsOfOrganizationsWithAccess.push(element.id);
      }
    });

    Sources.update(_id, {
      $set: {
        accessRestrictedTo: idsOfOrganizationsWithAccess,
        isRequestable: $('.js-source-access-request-checkbox').is(':checked'),
      },
    });

    $('button.js-save').addClass('unchanged');
  },
  'click .js-accept-access-request': (event) => {
    const requestId = $(event.currentTarget).data('requestId');

    Meteor.call('sourceAccessRequests.approve', { requestId }, err => {
      if (err) {
        showErrorNotification({ error: err });
        return;
      }

      showNotification({
        title: 'Request accepted',
        message: 'The requester will be notified.',
      });
    });
  },
  'click .js-ignore-access-request': (event) => {
    const requestId = $(event.currentTarget).data('requestId');

    Meteor.call('sourceAccessRequests.ignore', { requestId }, err => {
      if (err) {
        showErrorNotification({ error: err });
        return;
      }

      showNotification({
        title: 'Request ignored',
      });
    });
  },
});
// Template.sources_show_header.helpers(helpers);
Template.sources_show_access_page.helpers(helpers);
