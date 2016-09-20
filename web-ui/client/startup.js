// import '/imports/startup/client';
// import '/imports/startup/both';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.registerHelper('FlowRouter', FlowRouter);

Template.registerHelper('stringify', (object) => JSON.stringify(object, true, 4));
