import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

// import { Organizations } from '../../api/organizations/organizations.js';

// import './organizations-show-page.html';

// Components used inside the template
//import './app-not-found.js';
// import '../components/organizations-show.js';

Template.Organizations_show_page.onCreated(function organizationsShowPageOnCreated() {
  this.getOrganizationId = () => FlowRouter.getParam('_id');

  this.autorun(() => {
    this.subscribe('organizations.public');
  });
});

Template.Organizations_show_page.onRendered(function organizationsShowPageOnRendered() {  
  this.autorun(() => {
    //if (this.subscriptionsReady()) {
      //organizationRenderHold.release();
    //}
  });
});

Template.Organizations_show_page.helpers({
  // We use #each on an array of one item so that the "organization" template is
  // removed and a new copy is added when changing organizations, which is
  // important for animation purposes.
  organization() {    
    const organizationId = Template.instance().getOrganizationId();
    return Organizations.findOne(organizationId);
  },
  listIdArray() {
    const instance = Template.instance();
    const organizationId = instance.getOrganizationId();
    // return Organizations.findOne(organizationId) ? [organizationId] : [];
  },
  organizationArgs(organizationId) {
    const instance = Template.instance();
    // By finding the organization with only the `_id` field set, we don't create a dependency on the
    // `organization.incompleteCount`, and avoid re-rendering the todos when it changes
    // const organization = Organizations.findOne(organizationId, { fields: { _id: true } });
    // const todos = organization && organization.todos();
    return {
      todosReady: instance.subscriptionsReady(),
      // We pass `organization` (which contains the full organization, with all fields, as a function
      // because we want to control reactivity. When you check a todo item, the
      // `organization.incompleteCount` changes. If we didn't do this the entire organization would
      // re-render whenever you checked an item. By isolating the reactiviy on the organization
      // to the area that cares about it, we stop it from happening.
      // organization() {
      //   return Organizations.findOne(organizationId);
      // },
      // todos,
    };
  },
});
