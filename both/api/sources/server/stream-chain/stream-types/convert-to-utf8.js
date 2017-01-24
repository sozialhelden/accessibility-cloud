import iconv from 'iconv-lite';
import { check } from 'meteor/check';

iconv.encode('', 'utf8'); // Load all encodings -- iconv-lite has no real interface for this yet.
if (!iconv.encodings) {
  // If this should be thrown, you have to update the code to fetch the available iconv
  // encoding names in a new way.
  check(iconv.encodings, [String]);
  throw new Error('No iconv encodings available. Please update implementation.');
}

export class ConvertToUTF8 {
  constructor({ fromCharSet = 'utf8' }) {
    check(fromCharSet, String);
    this.stream = iconv.decodeStream(fromCharSet);
  }

  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return {
      fromCharset: {
        type: String,
        allowedValues: iconv.encodings,
      },
    };
  }
}
