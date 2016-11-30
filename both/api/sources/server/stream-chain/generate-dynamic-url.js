import { check } from 'meteor/check';
import { moment } from 'meteor/momentjs:moment';

export function generateDynamicUrl({ lastSuccessfulImport, sourceUrl }) {
  if (lastSuccessfulImport) {
    check(lastSuccessfulImport.startTimestamp, Number);
  }
  check(sourceUrl, String);
  const date = lastSuccessfulImport ? new Date(lastSuccessfulImport.startTimestamp) : new Date(0);
  return sourceUrl.replace(/{{lastImportDate}}/, moment(date).format('YYYY-MM-DD'));
}
