import basicAuth from 'basic-auth-connect';
import { WebApp } from 'meteor/webapp';

// Set up a HTTP basic auth password for the whole application.
export function setupHTTPAuthentication() {
  WebApp.connectHandlers.stack.splice(0, 0, {
    route: '',
    handle: basicAuth('ac', 'berlin2016'),
  });
}
