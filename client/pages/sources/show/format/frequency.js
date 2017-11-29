import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.import_flow_frequency.helpers({

});

Template.import_flow_frequency.events({
  'click .js-schedule-automatic-import'(event, templateInstance) {
    const schedule = templateInstance.find('select.js-schedule').value;
    Meteor.call('ImportFlows.scheduleAutomaticImport', this._id, schedule);
  },
  'click .js-stop-automatic-imports'() {
    Meteor.call('ImportFlows.stopAutomaticImports', this._id);
  },
});
