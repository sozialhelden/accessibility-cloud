import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Stream from 'stream';
const { RequestStream } = Npm.require('zstreams');

export function startObservingObjectProgress(stream, onProgress) {
  check(stream, Stream);

  const progress = {
    percentage: 0,
    transferred: 0,
    transferredCompressed: 0,
    transferredUncompressed: 0,
    length: 0,
    remaining: 0,
    eta: 0,
    runtime: 0,
    startTimestamp: Date.now(),
    delta: 0,
    speed: 0,
  };

  const timeInterval = 1000;

  const sendProgress = () => {
    const p = progress;
    let length = p.length;
    let transferred = p.transferred;
    if (!length && p.lengthCompressed) {
      length = p.lengthCompressed;
      transferred = p.transferredCompressed;
    }
    p.remaining = length ? length - transferred : 0;
    p.percentage = length ? 100 * transferred / length : 0;
    p.runtime = Date.now() - p.startTimestamp;
    p.speed = transferred / p.runtime;
    p.eta = p.remaining / p.speed;
    onProgress(p);
  };

  const interval = Meteor.setInterval(sendProgress, timeInterval);

  if (stream instanceof RequestStream || !stream.isReadableObjectMode) {
    stream.on('response', response => {
      // `response` is an unmodified http.IncomingMessage object
      response.on('data', chunk => {
        progress.transferredCompressed += chunk.length;
      });
    });
    stream.on('data', (chunk) => {
      progress.transferred += chunk.length;
    });
    progress.unitName = 'bytes';
  } else {
    stream.on('data', () => {
      progress.transferred++;
    });
    progress.unitName = stream.unitName || 'chunks';
  }

  stream.on('length', (length, isCompressed = false) => {
    console.log('Got response length', length, '(compressed:', isCompressed, ')');
    if (isCompressed) {
      progress.lengthCompressed = length;
    } else {
      progress.length = length;
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
