const { Transform } = Npm.require('zstreams');
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { KoboResult, transformKoboToA11y } from '@sozialhelden/a11yjson';


// transforms a result from an AC kobo survey to ac format
export default class TransformKobo {
  stream: any;
  source: any;

  lengthListener = (length: number) => this.stream.emit('length', length);

  pipeListener = (source: any) => {
    this.source = source;
    source.on('length', this.lengthListener);
  }

  constructor({
    onDebugInfo = (data: any) => {},
  }) {

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(data: KoboResult,
                encoding: string,
                callback: (error: Error, result?: any) => void) {
        try {
          const output = transformKoboToA11y(data);
          callback(null, output);
        } catch (error) {
          this.emit('error', error);
          callback(error);
        }
      },
    });

    this.stream.on('pipe', this.pipeListener);
    this.stream.unitName = 'objects';
  }

  dispose() {
    if (this.stream) {
      if (this.pipeListener) {
        this.stream.removeListener('pipe', this.pipeListener);
      }
      delete this.stream;
    }
    if (this.source) {
      if (this.lengthListener) {
        this.source.removeListener('length', this.lengthListener);
      }
      delete this.source;
    }
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
