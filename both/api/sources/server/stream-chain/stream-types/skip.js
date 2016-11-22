const { SkipStream } = Npm.require('zstreams');
import { check } from 'meteor/check';

export class Skip {
  constructor({ skip = 3 }) {
    check(skip, Number);
    this.stream = new SkipStream(skip, { objectMode: true });
    this.stream.on('pipe', source => {
      source.on('length', length => this.stream.emit('length', Math.max(0, length - skip)))
    });
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
