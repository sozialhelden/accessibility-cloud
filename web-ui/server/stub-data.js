import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/factory';

import { Languages } from '/both/api/languages/languages';
import { Licenses } from '/both/api/licenses/licenses';
import { Organizations } from '/both/api/organizations/organizations';
import { PlaceImports } from '/both/api/place-imports/place-imports';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { Sources } from '/both/api/sources/sources';

Factory.define('organization', Organizations, {
  name: 'ACME GmbH',
});

Factory.define('language', Languages, {
  name: 'Deutsch',
  languageCode: 'de',
});

Factory.define('license', Licenses, {
  name: 'Public Domain',
  text: 'You can freely use this dataset as you like.',
});

Factory.define('source', Sources, {
  organizationId: Factory.get('organization'),
  licenseId: Factory.get('license'),
  languageId: Factory.get('language'),
  name: 'Toilets in Vienna',
  primaryRegion: 'Vienna, Austria',
  description: 'All public toilets in vienna (JSON)',
  originWebsite: 'http://data.wien.gv.at',
  streamChain: [
    {
      type: 'httpDownload',
      parameters: {
        sourceUrl: 'http://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:WCANLAGEOGD&srsName=EPSG:4326&outputFormat=json',
      },
    },
    {
      type: 'convertCharacterSet',
      parameters: {
        from: 'iso-8895-1',
        to: 'utf-8',
      },
    },
    {
      type: 'parseJSON',
      parameters: {
        mappings: {
          _id: 'row.id',
          geometry: 'row.geometry',
          properties: 'row.properties',
          address: 'row.properties[\'STRASSE\'] + \', Bezirk \' + row.properties[\'BEZIRK\'] + \', Vienna, Austria\'',
          isAccessible: 'row.properties[\'KATEGORIE\'].includes(\'Behindertenkabine\')',
        },
      },
    },
  ],
});

Factory.define('sourceImport', SourceImports, {
  sourceId: Factory.get('source'),
  streamInfo: [
    {
      bytesRead: 1000,
      error: null,
      request: {
        url: Factory.get('source').url,
        method: 'GET',
        sendTimestamp: +new Date(),
        headers: {
          host: '127.0.0.1:8081',
          connection: 'keep-alive',
          'cache-control': 'max-age=0',
          accept: 'application/json',
          'accept-encoding': 'gzip, deflate, sdch',
        },
      },
      response: {
        httpVersion: '1.1',
        statusCode: 200,
        statusMessage: 'OK',
        headers: { 'content-length': '123',
          'content-type': 'text/json',
          connection: 'keep-alive',
          host: 'mysite.com',
          accept: '*/*',
        },
        head: '…',
        tail: '…',
      },
    },
    {
      bytesRead: 1000,
      error: null,
    },
    {
      bytesRead: 1000,
      error: 'Some example error that might have happened during reading the JSON',
    },
  ],

  numberOfPlacesAdded: 1,
  numberOfPlacesModified: 2,
  numberOfPlacesRemoved: 3,
  numberOfPlacesUnchanged: 4,
});

Factory.define('sampleSourceImport', SourceImports, Factory.extend('sourceImport', {
  sampleData: '…',
}));

Factory.define('placeInfo', PlaceInfos, {
  sourceId: Factory.get('source'),
  lastSourceImportId: Factory.get('sourceImport'),
  data: {
    providedId: '234234',
    name: 'Hotel Adlon',
    accessible: 0.2,
  },
});

Factory.define('placeImport', PlaceImports, {
  timestamp: 234234234,
  placeInfoId: Factory.get('placeInfo'),
  sourceImportId: Factory.get('sourceImport'),
});

// Create stub data for testing if the DB is empty
Meteor.startup(() => {
  if (Licenses.find().count() > 0) {
    return;
  }
  const license = Factory.create('license');
  const language = Factory.create('language');
  const organization = Factory.create('organization');
  const source = Factory.create('source', {
    organizationId: organization._id,
    languageId: language._id,
    licenseId: license._id,
  });
  const sourceImport = Factory.create('sourceImport', {
    sourceId: source._id,
  });
  const placeInfo = Factory.create('placeInfo', {
    sourceId: source._id,
  });
  const placeImport = Factory.create('placeImport', {
    placeInfoId: placeInfo._id,
    sourceImportId: sourceImport._id,
  });

  console.log({
    license,
    language,
    organization,
    source,
    sourceImport,
    placeInfo,
    placeImport,
  });
});
