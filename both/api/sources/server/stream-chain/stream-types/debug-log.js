const { PassThrough, LimitStream } = Npm.require('zstreams');

export class DebugLog {
  constructor({ onDebugInfo }) {
    this.stream = new PassThrough();
    this.stream
      // .pipe(new LimitStream(1))
      .intoString((error, string) => {
        onDebugInfo({ error, string });
      });
  }

  static getParameterSchema() {
    return {};
  }
}
