import * as gettextParser from 'gettext-parser';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { dasherize, tableize } from 'inflection';

import { projectSlug, auth } from './meteorSettings';


export default function exportToTransifex({ resourceSlug, poFile, asSourceFile, isNewResource }) {
  check(resourceSlug, String);
  check(poFile, Object);
  check(asSourceFile, Boolean);
  check(isNewResource, Boolean);
  const locale = poFile.headers.language;
  const poFileString = gettextParser.po.compile(poFile).toString();
  let response;
  if (isNewResource) {
    const url = `https://www.transifex.com/api/2/project/${projectSlug}/resources/`;
    const uploadJSON = {
      slug: resourceSlug,
      name: dasherize(tableize(resourceSlug)),
      accept_translations: true,
      i18n_type: 'PO',
      categories: [],
      priority: 0,
      content: poFileString,
    };
    console.log('Creating new resource with', locale, 'translations on transifex...', { auth, data: uploadJSON });
    response = HTTP.post(url, { auth, data: uploadJSON });
  }
  else {
    const url = `https://www.transifex.com/api/2/project/${projectSlug}/resource/${resourceSlug}/${asSourceFile ? 'content' : `translation/${locale}`}/`;
    const uploadJSON = { content: poFileString };
    console.log('Uploading', locale, 'translations to transifex...', { auth, data: uploadJSON });
    response = HTTP.put(url, { auth, data: uploadJSON });
  }
  if (response && response.statusCode > 299) {
    const message = 'Error while uploading to transifex.';
    console.error(message);
    console.error(response);
    throw new Meteor.Error(response.statusCode, message);
  }
  console.log('Successfully uploaded', locale, 'translations.');
}