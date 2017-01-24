import FastCSV from 'fast-csv';
import { _ } from 'meteor/underscore';

export class ParseCSVStream {
  constructor(options) {
    const csvOptions = _.pick(
      options,
      'headers',
      'ignoreEmpty',
      'discardUnmappedColumns',
      'strictColumnHandling',
      'delimiter',
      'quote',
      'escape'
    );

    this.stream = new FastCSV(csvOptions);
  }

  dispose() {
    delete this.stream;
  }
  
  static getParameterSchema() {
    return {
      objectMode: {
        type: Boolean,
        optional: true,
        description: 'Set to `true` to emit objects rather than a JSON string. Set to `false` to output a JSON string buffer.', // eslint-disable-line
        defaultValue: true,
      },
      headers: {
        type: Boolean,
        defaultValue: false,
        optional: true,
        description: 'Set to `true` if you expect the first line of your CSV to contain headers, alternatively you can specify an array of headers to use. You can also specify a sparse array to only include a specific set of columns.' // eslint-disable-line
      },
      ignoreEmpty: {
        type: Boolean,
        defaultValue: false,
        optional: true,
        description: 'Set to `true` to ignore empty rows.',
      },
      discardUnmappedColumns: {
        type: Boolean,
        defaultValue: false,
        optional: true,
        description: 'If you want to discard columns that do not map to a header',
      },
      strictColumnHandling: {
        type: Boolean,
        defaultValue: false,
        optional: true,
        description: 'If you want to consider empty lines/lines with too few fields as errors - Only to be used with `headers` set to `true`.', // eslint-disable-line
      },
      delimiter: {
        type: String,
        defaultValue: ',',
        optional: true,
        description: 'If your data uses an alternate delimiter such as `;` or `\\t`. When specifying an alternate delimiter you may only pass in a single character delimiter', // eslint-disable-line
      },
      quote: {
        type: String,
        defaultValue: '"',
        optional: true,
        description: 'The character to use to escape values that contain a delimiter. If you set to null then all quoting will be ignored', // eslint-disable-line
      },
      escape: {
        type: String,
        defaultValue: '"',
        optional: true,
        description: 'The character to use when escaping a value that is quoted and contains a quote character, i.e: : \'First,"Name"\' => \'"First,""name"""\'', // eslint-disable-line
      },
      trim: {
        type: Boolean,
        defaultValue: false,
        optional: true,
        description: 'Set to `true` to trim all parsed values.',
      },
      rtrim: {
        type: Boolean,
        defaultValue: false,
        optional: true,
        description: 'Set to `true` to right trim all parsed values.',
      },
      ltrim: {
        type: Boolean,
        defaultValue: false,
        optional: true,
        description: 'Set to `true` to left trim all parsed values.',
      },
      comment: {
        type: String,
        defaultValue: null,
        optional: true,
        description: 'If your CSV contains comments, specify a character for this parameter to ignore lines that begin with the specified character (e.g. `#`).', // eslint-disable-line
      },
    };
  }
}
