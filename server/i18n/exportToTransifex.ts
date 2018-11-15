import * as gettextParser from 'gettext-parser';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { dasherize, tableize } from 'inflection';

import { projectSlug, auth } from './meteorSettings';
import { POFile } from './i18nTypes';

export default function exportToTransifex({
  resourceSlug,
  poFile,
  asSourceFile,
  isNewResource,
}: {
  resourceSlug: string;
  poFile: POFile;
  asSourceFile: boolean;
  isNewResource: boolean;
}) {
  const locale = poFile.headers.language;
  const poFileString = gettextParser.po.compile(poFile).toString();

  let response;

  if (isNewResource) {
    const url = `https://www.transifex.com/api/2/project/${projectSlug}/resources/`;
    const data = {
      slug: resourceSlug,
      name: dasherize(tableize(resourceSlug)),
      accept_translations: true,
      i18n_type: 'PO',
      categories: [],
      priority: 0,
      content: poFileString,
    };
    console.log(
      'Creating new resource',
      projectSlug,
      '/',
      resourceSlug,
      'with',
      locale,
      'translations on transifex...',
    );
    response = HTTP.post(url, { auth, data });
  } else {
    const url = `https://www.transifex.com/api/2/project/${projectSlug}/resource/${resourceSlug}/${
      asSourceFile ? 'content' : `translation/${locale}`
    }/`;
    const data = { content: poFileString };
    console.log(
      'Uploading',
      locale,
      'translations to transifex resource',
      projectSlug,
      '/',
      resourceSlug,
    );
    response = HTTP.put(url, { auth, data });
  }

  if (response && response.statusCode && response.statusCode > 299) {
    const message = 'Error while uploading to transifex.';
    console.error(message);
    console.error(response);
    throw new Meteor.Error(response.statusCode, message);
  }

  console.log('Successfully uploaded', locale, 'translations.');
}
