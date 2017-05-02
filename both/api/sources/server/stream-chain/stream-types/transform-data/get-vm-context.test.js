/* eslint-env mocha */

import vm from 'vm';
import { assert } from 'meteor/practicalmeteor:chai';
import getVMContext from './get-vm-context';

describe('getVMContext', () => {
  it('is a function', () => {
    assert.isFunction(getVMContext);
  });

  describe('context', () => {
    let context;

    before(() => {
      context = getVMContext();
    });

    it('is a node VM context', () => {
      assert(vm.isContext(context));
    });

    it('exposes `_` as a global variable', () => {
      assert.equal(vm.runInContext('typeof _', context), 'function');
    });

    it('mixes in lodash-inflection correctly', () => {
      assert.equal(vm.runInContext('typeof _.pluralize', context), 'function');
    });

    it('exposes `categoryIdForSynonyms` as a global variable', () => {
      assert.equal(vm.runInContext('typeof categoryIdForSynonyms', context), 'object');
    });

    it('exposes `helpers` as a global variable', () => {
      assert.equal(vm.runInContext('typeof helpers', context), 'object');
    });

    it('does not interfere with the host vm', () => {
      const maliciousCode = `
        JSON.stringify = function() {
          return "borked!";
        };
      `;

      vm.runInContext(maliciousCode, context);
      assert.equal(JSON.stringify({}), '{}');
    });
  });
});
