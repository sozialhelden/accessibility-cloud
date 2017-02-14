/* eslint-env mocha */

import { assert } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';
import { TransformData } from './index';

const {
  Transform,
  Readable,
} = Npm.require('zstreams');

describe('TransformData', () => {
  it('is a function', () => {
    assert.isFunction(TransformData);
  });

  describe('instance', () => {
    let instance;

    function buildInstance(args = {
      mappings: {},
    }) {
      instance = new TransformData(args);
    }

    it('has a `stream` property', () => {
      buildInstance();
      assert.property(instance, 'stream');
      assert.instanceOf(instance.stream, Transform);
    });

    it('runs the javascript passed as argument on data that flows into its stream', (done) => {
      buildInstance({
        mappings: {
          a: 'd.a',
          b: '_.identity(d.b)',
          c: '_.clamp(d.c, -10, 10)',
          number: 'helpers.extractNumber(d.number)',
        },
      });

      const sourceData = {
        a: 'foo',
        b: 'bar',
        c: 1222,
        number: '-12.55',
      };
      const myReadable = new Readable({
        objectMode: true,
        read() {
          this.push(sourceData);
          this.push(null);
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
        assert(spy.calledOnce);
        console.log(JSON.stringify(spy.getCall(0).args[0], null, 4));
        assert.deepEqual(spy.getCall(0).args[0], {
          a: 'foo',
          b: 'bar',
          c: 10,
          number: -12.55,
          properties: {
            originalData: JSON.stringify(sourceData),
          },
        });

        done();
      });

      instance.stream.on('error', err => console.error(err));

      myReadable.pipe(instance.stream).pipe(sink);
    });
  });
});
