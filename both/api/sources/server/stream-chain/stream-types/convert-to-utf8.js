import iconv from 'iconv-lite';
import { check } from 'meteor/check';

export class ConvertToUTF8 {
  constructor({ fromCharSet = 'utf8' }) {
    check(fromCharSet, String);
    this.stream = iconv.decodeStream(fromCharSet);
  }
}
