import './app-body.html';

import { Template } from 'meteor/templating';

import { helpers, events, onCreated } from './helpers';

import './app-layout-startpage.html';

Template.app_layout_start_page.onCreated(onCreated);
Template.app_layout_start_page.helpers(helpers);
Template.app_layout_start_page.events(events);

