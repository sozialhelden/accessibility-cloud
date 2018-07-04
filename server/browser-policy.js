import { Meteor } from 'meteor/meteor';

/* globals BrowserPolicy */

BrowserPolicy.content.allowOriginForAll('api.mapbox.com');
BrowserPolicy.content.allowOriginForAll('npmcdn.com');
BrowserPolicy.content.allowOriginForAll('secure.gravatar.com');
BrowserPolicy.content.allowOriginForAll('blob:');
BrowserPolicy.content.allowImageOrigin('*.mapbox.com');
BrowserPolicy.content.allowStyleOrigin('*.mapbox.com');

if (process.env.NODE_ENV === 'development') {
  BrowserPolicy.content.allowOriginForAll('localhost:*');
}

// TODO configure s3 image access here
