import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Categories } from '/both/api/categories/categories.js';
import { Sources } from '/both/api/sources/sources.js';
import subsManager from '/client/lib/subs-manager';

import { _ } from 'meteor/underscore';

Template.categories_list_page.onCreated(function organizationsShowPageOnCreated() {
  subsManager.subscribe('categories.public');
  subsManager.subscribe('organizations.withContent.mine');
});


Template.categories_list_page.helpers({
  categories() {
    return Categories.find({});
  },
  importResult() {
    Session.get('import-result');
  },
});

Template.categories_list_page.events({
  'click .js-import': function (event) {
    event.preventDefault();

    const newCategoryDefinitionsAsCSV = $('textarea#categoriesAsCSV')[0].value;

    Meteor.call('categories.import', newCategoryDefinitionsAsCSV, (err, result) => {
      Session.set('import-result', result);
    });
  },
});
