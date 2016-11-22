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
      compilationError: `JavaScript compilation error:\n${error}\n${error.stack}\n${error.reason}\n${error.message}`
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

    this.stream.on('pipe', source => {
      source.on('length', length => this.stream.emit('length', length));
    });
    
    this.stream.unitName = 'objects';
  }

  static getParameterSchema() {
    return new SimpleSchema({

    });
  }
}
