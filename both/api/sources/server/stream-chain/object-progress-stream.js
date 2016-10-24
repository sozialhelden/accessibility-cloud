import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Stream from 'stream';

export class ObjectProgressStream {
  constructor(stream, onProgress) {
    check(stream, Stream);
    check(onProgress, Function);

    this.progress = {
      percentage: 0,
      transferred: 0,
      length: 0,
      remaining: 0,
      eta: 0,
      runtime: 0,
      startTimestamp: Date.now(),
      delta: 0,
      speed: 0,
    };

    const timeInterval = 1000;
    let lastTransferred = 0;

    const sendProgress = () => {
      const p = this.progress;
      p.remaining = p.length ? p.length - p.transferred : 0;
      p.delta = p.transferred - lastTransferred;
      lastTransferred = p.transferred;
      p.speed = p.delta / (0.001 * timeInterval);
      p.percentage = p.length ? 100 * p.transferred / p.length : 0;
      p.eta = p.remaining / p.speed;
      p.runtime = Date.now() - p.startTimestamp;
      onProgress(p);
    };

    const interval = Meteor.setInterval(sendProgress, timeInterval);

    stream.on('data', () => {
      this.progress.transferred++;
    });

    stream.on('length', (length) => {
      this.progress.length = length;
    });

    stream.on('error', () => {
      clearInterval(interval);
      sendProgress();
    });

    stream.on('finish', () => {
      clearInterval(interval);
      sendProgress();
    });

    sendProgress();
  }
}
