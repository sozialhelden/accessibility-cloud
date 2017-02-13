import { check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'lodash';
import entries from '/both/lib/entries';
import getHelpers from './get-helpers';
import vm from 'vm';

const { Transform } = Npm.require('zstreams');

function compileMapping(fieldName, javascript, context) {
  const code = `(d) => (${javascript})`;

  return vm.runInContext(code, context);
}

function compileMappings(mappings, context) {
  const result = {};
  for (const [fieldName, javascript] of entries(mappings)) {
    try {
      result[fieldName] = compileMapping(fieldName, javascript, context);
    } catch (error) {
      if (error instanceof SyntaxError) {
        error.message = `${error.message} (in field '${fieldName}')`;
      }
      throw error;
    }
  }
  return result;
}

export class TransformData {
  constructor({ mappings }) {
    check(mappings, Object);

    const globalObject = getHelpers();
    const context = this.context = vm.createContext(globalObject);

    const compiledMappings = this.compiledMappings = compileMappings(mappings, context);

    let hadError = false;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        try {
          if (hadError) { return; }

          const output = {};

          for (const [fieldName, fn] of entries(compiledMappings)) {
            const value = fn(chunk);
            if (fieldName.match(/-/)) {
              // Field name is probably a key path like 'a-b-c'
              if (value !== undefined && value !== null) {
                // Don't polute database with undefined properties
                _.set(output, fieldName.replace(/-/g, '.'), value);
              }
            } else {
              output[fieldName] = value;
            }
          }
          output.properties = output.properties || {};
          output.properties.originalData = JSON.stringify(chunk);
          callback(null, output);
        } catch (error) {
          hadError = true;
          this.emit('error', error);
          callback(error);
          return;
        }
      },
    });

    this.lengthListener = length => this.stream.emit('length', length);
    this.pipeListener = source => {
      this.source = source;
      source.on('length', this.lengthListener);
    };
    this.stream.on('pipe', this.pipeListener);
    this.stream.unitName = 'places';
  }

  dispose() {
    delete this.compiledMappings;
    this.stream.removeListener('pipe', this.pipeListener);
    delete this.pipeListener;
    if (this.source) {
      this.source.removeListener('length', this.lengthListener);
    }
    delete this.lengthListener;
    delete this.source;
    delete this.stream;
    delete this.context;
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
