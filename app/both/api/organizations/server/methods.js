import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Organizations } from '../organizations';
import { OrganizationMembers } from '/both/api/organization-members/organization-members';


export const insert = new ValidatedMethod({
  name: 'organizations.insert',
  validate: Organizations.simpleSchema().validator(),
  run(doc) {
    console.log('Inserting organization and first membership:', doc, 'for user id', this.userId);
    const organizationId = Organizations.insert(doc);
    OrganizationMembers.insert({
      organizationId,
      userId: this.userId,
      role: 'manager',
    });
    return organizationId;
  },
});


export const remove = new ValidatedMethod({
  name: 'organizations.remove',
  validate: new SimpleSchema({
    organizationId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ organizationId }) {
    const organization = Organizations.findOne(organizationId);

    if (!organization.editableBy(this.userId)) {
      throw new Meteor.Error(403,
        'You don\'t have permission to remove this organization.');
    }

    OrganizationMembers.remove({ organizationId });
    Organizations.remove(organizationId);
  },
});
