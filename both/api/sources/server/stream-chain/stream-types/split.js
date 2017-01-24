const { SplitStream } = Npm.require('zstreams');
import { check, Match } from 'meteor/check';

export class Split {
  constructor({ string, regExpString }) {
    check(string, Match.Optional(String));
    check(regExpString, Match.Optional(String));
    const matcher = string || (regExpString ? new RegExp(regExpString) : undefined) || /\r?\n/;
    this.stream = new SplitStream(matcher);
    this.stream.unitName = 'strings';
  }
  
  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return {
      string: {
        type: String,
        description: 'The string or character that should be used to split the incoming byte stream into string objects.', // eslint-disable-line
        optional: true,
      },
      regExpString: {
        type: RegExp,
        description: 'Regexp that should be used to split the incoming byte stream into string objects.', // eslint-disable-line
        defaultValue: /\r?\n/,
        optional: true,
      },
    };
  }
}
