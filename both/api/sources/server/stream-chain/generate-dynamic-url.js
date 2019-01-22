import { check } from 'meteor/check';
import { moment } from 'meteor/momentjs:moment';

export function generateDynamicUrl({ lastSuccessfulImport, sourceUrl }) {
  if (lastSuccessfulImport) {
    check(lastSuccessfulImport.startTimestamp, Number);
  }
  check(sourceUrl, String);

  const importMoment = moment(
    lastSuccessfulImport ? new Date(lastSuccessfulImport.startTimestamp) : new Date(0));

  // last import date in YYYY-MM-DD format
  let replacedUrl = sourceUrl.replace(/{{lastImportDate}}/g, importMoment.format('YYYY-MM-DD'));
  // last import date in ISO_8601 format
  replacedUrl = sourceUrl.replace(/{{lastImportISODate}}/g, importMoment.format());

  return replacedUrl;
}
