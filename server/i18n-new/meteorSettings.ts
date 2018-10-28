import { Meteor } from 'meteor/meteor';

export const { projectSlug, username, password } = Meteor.settings.transifex;
export const auth = `${username}:${password}`;
