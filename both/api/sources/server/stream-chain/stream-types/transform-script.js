const { Transform } = Npm.require('zstreams');
import { check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

function compileMappingFunction(javascript) {
  try {
    // Should be moved to a sandbox at some point. https://nodejs.org/api/vm.html
    // eslint-disable-next-line no-eval
    return eval(`(d) => (${javascript})`);
  } catch (error) {
    console.error(`JavaScript compilation error:\n${error}\n${error.stack}\n${error.reason}\n${error.message}`);
    return () => {};
  }
}

export class TransformScript {
  constructor({ javaScript, onDebugInfo }) {
    check(javaScript, String);

    const compiledScript = compileMappingFunction(javaScript);

    let firstInputObject = null;
    let firstOutputObject = null;

    this.stream = new Transform({
      transform(data, encoding, callback) {
        if (!firstInputObject) {
          firstInputObject = data;
          onDebugInfo({ firstInputObject });
        }
        const output = compiledScript(data);

        if (!firstOutputObject) {
          firstOutputObject = output;
          onDebugInfo({ firstOutputObject });
        }

        callback(null, output);
        return null;
      },
    });
  }

  static getParameterSchema() {
    return new SimpleSchema({

    });
  }
}
