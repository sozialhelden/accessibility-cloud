import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check } from 'meteor/check';
import { TAPi18n } from 'meteor/tap:i18n';
import { isAdmin } from '/both/lib/is-admin';

SimpleSchema.debug = true;

Meteor.methods({
  'users.approve'(_id) {
    check(_id, String);
    if (!this.userId) {
      throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, TAPi18n.__('You are not authorized to import categories.'));
    }
    const user = Meteor.users.find({ _id });
    if (!user) {
      throw new Meteor.Error(403, TAPi18n.__('Can not find user with this id.'));
    }
    Meteor.users.update({ _id }, { $set: { isApproved: true } });
  },
  'users.remove'(_id) {
    check(_id, String);
    if (!this.userId) {
      throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, TAPi18n.__('You are not authorized to import categories.'));
    }
    const user = Meteor.users.find({ _id });
    if (!user) {
      throw new Meteor.Error(403, TAPi18n.__('Can not find user with this id.'));
    }
    Meteor.users.remove({ _id });
  },
});
