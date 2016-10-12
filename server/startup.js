import { Meteor } from 'meteor/meteor';
import { setupHTTPAuthentication } from '/imports/startup/server/http-basic-auth';

Meteor.startup(setupHTTPAuthentication);

BrowserPolicy.content.allowOriginForAll('api.mapbox.com');
BrowserPolicy.content.allowOriginForAll('npmcdn.com');
