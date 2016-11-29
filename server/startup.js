import { Meteor } from 'meteor/meteor';
import { setupHTTPAuthentication } from '/imports/startup/server/http-basic-auth';

BrowserPolicy.content.allowOriginForAll('api.mapbox.com');
BrowserPolicy.content.allowOriginForAll('npmcdn.com');
BrowserPolicy.content.allowOriginForAll('secure.gravatar.com');
