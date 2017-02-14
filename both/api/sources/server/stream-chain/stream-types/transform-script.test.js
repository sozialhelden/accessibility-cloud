/* eslint-env mocha */

import _ from 'lodash';
import { assert } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';
import { TransformScript } from './transform-script';

const {
  Transform,
  Readable,
} = Npm.require('zstreams');

describe('TransformScript', () => {
  it('is a function', () => {
    assert.isFunction(TransformScript);
  });

  describe('instance', () => {
    let instance;

    function buildInstance(args = {
      javascript: 'd',
    }) {
      instance = new TransformScript(args);
    }

    it('has a `stream` property', () => {
      buildInstance();
      assert.property(instance, 'stream');
      assert.instanceOf(instance.stream, Transform);
    });

    it('runs the javascript passed as argument on data that flows into its stream', (done) => {
      buildInstance({
        javascript: 'd.data',
      });

      let count = 0;
      const chunks = 4;

      const myReadable = new Readable({
        objectMode: true,
        read() {
          if (count++ < chunks) {
            this.push({
              data: 'some data',
            });
          } else {
            this.push(null);
          }
        },
      });

      const spy = sinon.spy();

      const sink = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
          spy(chunk);
          callback();
        },
      });

      sink.on('finish', () => {
        assert.equal(spy.callCount, chunks);
        _.range(chunks).forEach((callNum) => {
          assert.equal(spy.getCall(callNum).args[0], 'some data');
        });

        done();
      });

      myReadable.pipe(instance.stream).pipe(sink);
    });
  });
});
