import EventStream from 'event-stream';
import { check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ObjectProgressStream } from '../object-progress-stream';


function compileMappingFunction(javascript) {
  try {
    // Should be moved to a sandbox at some point. https://nodejs.org/api/vm.html
    // eslint-disable-next-line no-eval
    return eval(`(inputData) => (${javascript})`);
  } catch (error) {
    console.error(`JavaScript compilation error:\n${error}\n${error.stack}\n${error.reason}\n${error.message}`);
    return () => {};
  }
}

export class TransformScript {
  constructor({ javaScript, onProgress, onDebugInfo }) {
    check(javaScript, String);
    check(onProgress, Function);
    const compiledScript = compileMappingFunction(javaScript);

    let firstInputObject = null;
    let firstOutputObject = null;

    this.stream = EventStream.map((data, callback) => {
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
    });

    this.progressStream = new ObjectProgressStream(this.stream, onProgress);
  }

  static getParameterSchema() {
    return new SimpleSchema({

    });
  }
}
