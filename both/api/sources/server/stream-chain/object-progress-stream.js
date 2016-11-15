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
      unitName: 'objects',
    };

    const timeInterval = 500;
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
      p.unitName = 'objects';
      onProgress(p);
    };

    const interval = Meteor.setInterval(sendProgress, timeInterval);

    stream.on('data', () => {
      this.progress.transferred++;
    });

    stream.on('length', (length) => {
      this.progress.length = length;
    });

    stream.on('error', (error) => {
      clearInterval(interval);
      if (error) {
        this.progress.hasError = true;
      }
      sendProgress();
    });

    stream.on('end', () => {
      clearInterval(interval);
      this.progress.finishedTimestamp = Date.now();
      if (!this.progress.hasError) {
        this.progress.isFinished = true;
      }
      sendProgress();
    });

    sendProgress();
  }
}
