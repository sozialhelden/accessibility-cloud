import { Template } from 'meteor/templating';
import { helpers, events, onCreated } from './helpers';
import '../components/loading.js';
import './app-layout-scrollable.html';

Template.app_layout_scrollable.onCreated(onCreated);
Template.app_layout_scrollable.helpers(helpers);
Template.app_layout_scrollable.events(events);
