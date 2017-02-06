import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import { $ } from 'meteor/jquery';
import subsManager from '/client/lib/subs-manager';


Template.sources_show_access_page.onCreated(() => {
  subsManager.subscribe('sourceImports.public');
  subsManager.subscribe('sourceImports.private');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('sources.private');
  subsManager.subscribe('organizations.public');

  window.Sources = Sources; // FIXME: we don't need that only for debugging
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
  selectedIfAccessibleToAll() {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });
    if (source.isFreelyAccessible) {
      return 'selected';
    }
    return '';
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
      $set: { accessRestrictedTo: idsOfOrganizationsWithAccess },
    });
    $('button.js-save').addClass('unchanged');
  },
});
// Template.sources_show_header.helpers(helpers);
Template.sources_show_access_page.helpers(helpers);
