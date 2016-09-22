import { Mongo } from 'meteor/mongo';
import { isAdmin } from '/both/lib/is-admin';

export const SourceImports = new Mongo.Collection('SourceImports');

SourceImports.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});


  // sourceId: Factory.get('source'),
  // streamInfo: [
  //   {
  //     bytesRead: 1000,
  //     error: null,
  //     request: {
  //       url: Factory.get('source').url,
  //       method: 'GET',
  //       sendTimestamp: +new Date(),
  //       headers: {
  //         host: '127.0.0.1:8081',
  //         connection: 'keep-alive',
  //         'cache-control': 'max-age=0',
  //         accept: 'application/json',
  //         'accept-encoding': 'gzip, deflate, sdch',
  //       },
  //     },
  //     response: {
  //       httpVersion: '1.1',
  //       statusCode: 200,
  //       statusMessage: 'OK',
  //       headers: { 'content-length': '123',
  //         'content-type': 'text/json',
  //         connection: 'keep-alive',
  //         host: 'mysite.com',
  //         accept: '*/*',
  //       },
  //       head: '…',
  //       tail: '…',
  //     },
  //   },
  //   {
  //     bytesRead: 1000,
  //     error: null,
  //   },
  //   {
  //     bytesRead: 1000,
  //     error: 'Some example error that might have happened during reading the JSON',
  //   },
  // ],

  // numberOfPlacesAdded: 1,
  // numberOfPlacesModified: 2,
  // numberOfPlacesRemoved: 3,
  // numberOfPlacesUnchanged: 4,


SourceImports.publicFields = {
  sourceId: 1,
  streamInfo: 1,
  numberOfPlacesAdded: 1,
  numberOfPlacesModified: 1,
  numberOfPlacesRemoved: 1,
  numberOfPlacesUnchanged: 1,
};

SourceImports.helpers({
  editableBy: isAdmin,
});
