import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Sources } from '/both/api/sources/sources';

Template.component_source.onRendered(function rendered() {
  if (this.data.source) {
    this.subscribe('sourceImports.public');
  }
});

Template.component_source.helpers({
  isVisible() {
    const source = Sources.findOne(this._id);

    return source && source.isVisibleForUserId(Meteor.userId());
  },
});
