import './app-body.html';

import { Template } from 'meteor/templating';

import { helpers, events, onCreated } from './helpers';

import './app-layout-full-size.html';

Template.app_layout_full_size.onCreated(onCreated);
Template.app_layout_full_size.helpers(helpers);
Template.app_layout_full_size.events(events);
