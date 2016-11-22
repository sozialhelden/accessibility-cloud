import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Stream from 'stream';
const { RequestStream } = Npm.require('zstreams');

export function startObservingObjectProgress(stream, onProgress) {
  check(stream, Stream);

  const progress = {
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
    const p = progress;
    p.remaining = p.length ? p.length - p.transferred : 0;
    p.delta = p.transferred - lastTransferred;
    lastTransferred = p.transferred;
    p.speed = p.delta / timeInterval;
    p.percentage = p.length ? 100 * p.transferred / p.length : 0;
    p.eta = p.remaining / p.speed;
    p.runtime = Date.now() - p.startTimestamp;
    onProgress(p);
  };

  const interval = Meteor.setInterval(sendProgress, timeInterval);

  if (stream instanceof RequestStream) {
    stream.on('response', response => {
      // unmodified http.IncomingMessage object
      response.on('data', chunk => {
        // count compressed data as it is received, not uncompressed data
        progress.transferred += chunk.length;
      });
    });
    progress.unitName = 'bytes';
  } else if (stream.isReadableObjectMode) {
    stream.on('data', () => {
      progress.transferred++;
    });
    progress.unitName = stream.unitName || 'chunks';
  } else {
    stream.on('data', (chunk) => {
      progress.transferred += chunk.length;
    });
    progress.unitName = 'bytes';
  }

  stream.on('length', (length) => {
    progress.length = length;
  });

  stream.on('response', response => {
    if (response.headers && response.headers['content-length']) {
      progress.length = response.headers['content-length'];
    }
  });

  stream.on('abort', () => {
    progress.isAborted = true;
    sendProgress();
  });

  stream.on('error', (error) => {
    clearInterval(interval);
    if (error) {
      progress.hasError = true;
    }
    sendProgress();
  });

  stream.on('end', () => {
    clearInterval(interval);
    progress.finishedTimestamp = Date.now();
    if (!progress.hasError) {
      progress.isFinished = true;
    }
    sendProgress();
  });

  sendProgress();
}
