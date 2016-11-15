import { Template } from 'meteor/templating';
import { helpers, events, onCreated } from '/client/_layouts/helpers';
import '../components/loading.js';
import './header-logged-in.html';

Template.header_logged_in.onCreated(onCreated);
Template.header_logged_in.helpers(helpers);
Template.header_logged_in.events(events);
