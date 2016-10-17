import './app-body.html';

import { Template } from 'meteor/templating';

import { helpers, events, onCreated } from './helpers';

import './app-layout-mapview.html';

Template.app_layout_mapview.onCreated(onCreated);
Template.app_layout_mapview.helpers(helpers);
Template.app_layout_mapview.events(events);
