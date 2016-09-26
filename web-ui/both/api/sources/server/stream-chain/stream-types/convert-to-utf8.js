import iconv from 'iconv-lite';
import { check } from 'meteor/check';

export class ConvertToUTF8 {
  constructor({ fromCharSet }) {
    check(fromCharSet, String);
    this.stream = iconv.decodeStream(fromCharSet);
  }
}
