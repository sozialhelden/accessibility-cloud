const { Transform } = Npm.require('zstreams');
import { check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

function compileMappingFunction(javascript, onDebugInfo) {
  try {
    // Should be moved to a sandbox at some point. https://nodejs.org/api/vm.html
    // eslint-disable-next-line no-eval
    return eval(`(d) => (${javascript})`);
  } catch (error) {
    onDebugInfo({
      compilationError: [
        'JavaScript compilation error:',
        error,
        error.stack,
        error.reason,
        error.message,
      ].join('\n'),
    });
    return () => {};
  }
}

export class TransformScript {
  constructor({ javascript, onDebugInfo }) {
    check(javascript, String);

    const compiledScript = compileMappingFunction(javascript, onDebugInfo);

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(data, encoding, callback) {
        const output = compiledScript(data);

        callback(null, output);
        return null;
      },
    });

    this.lengthListener = length => this.stream.emit('length', length);
    this.pipeListener = source => {
      this.source = source;
      source.on('length', this.lengthListener);
    };
    this.stream.on('pipe', this.pipeListener);

    this.stream.unitName = 'objects';
  }

  dispose() {
    this.stream.removeListener('pipe', this.pipeListener);
    delete this.pipeListener;
    this.source.removeListener('length', this.lengthListener);
    delete this.source;
    delete this.lengthListener;
    delete this.stream;
    delete this.compiledScript;
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
