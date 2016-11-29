import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import subsManager from '/client/lib/subs-manager';

Template.members_list_page.onCreated(() => {
  subsManager.subscribe('users.public');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('organizationMembers.public');
});

function getOrganizationForView() {
  if (FlowRouter._current.route.name === 'manage.organizations.show.members') {
    const organizationId = FlowRouter.getParam('_id');
    return Organizations.findOne({ _id: organizationId });
  }

  const memberId = FlowRouter.getParam('_id');
  const member = OrganizationMembers.findOne({ _id: memberId });
  if (member) {
    return Organizations.findOne({ _id: member.organizationId });
  }
  return [];
}

Template.members_list_page.helpers({
  OrganizationMembers,
  invitationStateAsHTML() {
    switch (this.invitationState) {
      case 'queuedForSending': return 'sending invitation…';
      case 'sent': return 'invited';
      case 'error': return `<span class='error'>error: ${this.invitationError}</span>`;
      default: return null;
    }
  },
  inviteMemberSchema() {
    return OrganizationMembers.schema.pick(['invitationEmailAddress', 'organizationId']);
  },
  memberRoleSchema() {
    return OrganizationMembers.schema.pick(['role']);
  },
  members() {
    const orga = getOrganizationForView();
    if (orga) {
      return OrganizationMembers.find({ organizationId: orga._id });
    }
    return [];
  },
  organization() {
    return getOrganizationForView();
  },
  activeIfCurrentMember(_id) {
    return _id === FlowRouter.getParam('_id') ? 'active' : '';
  },
});

Template.members_list_page.events({
  'click .js-remove-member'(event) {
    OrganizationMembers.remove(this._id, error => {
      if (error) {
        alert(`Could not remove member: ${error}`);
      }
    });
    event.preventDefault();
  },
});
