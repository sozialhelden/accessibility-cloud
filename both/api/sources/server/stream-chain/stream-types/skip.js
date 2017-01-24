const { SkipStream } = Npm.require('zstreams');
import { check } from 'meteor/check';

export class Skip {
  constructor({ skip = 3 }) {
    check(skip, Number);
    this.stream = new SkipStream(skip, { objectMode: true });

    this.lengthListener = length => this.stream.emit('length', Math.max(0, length - skip));
    this.pipeListener = source => {
      this.source = source;
      source.on('length', this.lengthListener);
    };
    this.stream.on('pipe', this.pipeListener);
  }

  dispose() {
    this.stream.removeListener('pipe', this.pipeListener);
    delete this.pipeListener;
    this.source.removeListener('length', this.lengthListener);
    delete this.lengthListener;
    delete this.source;
    delete this.stream;
  }

  static getParameterSchema() {
    return {
      skip: {
        type: Number,
        defaultValue: 0,
      },
    };
  }
}
