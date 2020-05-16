import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Categories } from '/both/api/categories/categories.js';
import subsManager from '/client/lib/subs-manager';
import { $ } from 'meteor/jquery';

// import { _ } from 'meteor/underscore';

Template.categories_list_page.onCreated(function organizationsShowPageOnCreated() {
  subsManager.subscribe('categories.public');
});


Template.categories_list_page.helpers({
  categories() {
    return Categories.find({});
  },
  splitCommas(d) {
    return d ? d.replace(/,/g, ', ') : '';
  },
  joinList(l) {
    return l.join(', ');
  },
});

Template.categories_list_page.events({
  'click .js-import': (event) => {
    event.preventDefault();

    const newCategoryDefinitionsAsCSV = $('textarea#categoriesAsCSV')[0].value;

    Meteor.call('categories.import', newCategoryDefinitionsAsCSV, (err, result) => {
      $('.js-error').html(err ? JSON.stringify(err, true, 2) : '');
      $('.js-result').html(result || '');
    });
  },
});
