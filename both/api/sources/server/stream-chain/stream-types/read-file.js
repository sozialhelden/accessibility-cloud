import fs from 'fs';
import Path from 'path';
import { check } from 'meteor/check';

export class ReadFile {
  constructor({ path }) {
    check(path, String);
    // eslint-disable-next-line no-undef
    const filePath = Assets.absoluteFilePath(Path.join('source-data', path));
    this.stream = fs.createReadStream(filePath, { flags: 'r' });
  }
}
