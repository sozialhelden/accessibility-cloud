import './app-body.html';

import { Template } from 'meteor/templating';

import { helpers, events, onCreated } from './helpers';

import '../components/loading.js';

Template.App_body.onCreated(onCreated);
Template.App_body.helpers(helpers);
Template.App_body.events(events);
