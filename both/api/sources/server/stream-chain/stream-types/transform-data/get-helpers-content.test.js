/* eslint-env mocha */

import vm from 'vm';
import _ from 'lodash';
import { assert } from 'meteor/practicalmeteor:chai';
import getHelpersContent from './get-helpers-content';

describe('getHelpersContent', () => {
  it('is a function', () => {
    assert.isFunction(getHelpersContent);
  });

  describe('content', () => {
    let content;

    before(() => {
      content = getHelpersContent();
    });

    it('is a string', () => {
      assert.isString(content);
    });
  });

  describe('evaluated object', () => {
    let globalObject;
    let context;
    let helpersObj;

    before(() => {
      globalObject = {};
      context = vm.createContext(globalObject);
      const setupCode = `
        'use strict';

        var helpers = ${getHelpersContent()};
      `;

      vm.runInContext(setupCode, context);
      helpersObj = globalObject.helpers;
    });

    const EXPECTED_METHOD_PATHS = [
      'AXSMaps.estimateFlagFor',
      'AXSMaps.estimateRatingFor',
      'AXSMaps.getCategoryFromList',
      'AXSMaps.guessGeoPoint',
      'OSM.fetchNameFromTags',
      'OSM.fetchCategoryFromTags',
      'kobo.parseValue',
      'kobo.parseYesNo',
      'kobo.parseHasSubObject',
      'kobo.parseFloatUnit',
      'kobo.parseIntUnit',
      'extractNumber',
      'md5',
      'convertOSGB36ToWGS84Point',
      'convert3LetterCountryCode',
    ];

    EXPECTED_METHOD_PATHS.forEach((methodPath) => {
      it(`has a ${methodPath} method`, () => {
        assert.isFunction(_.get(helpersObj, methodPath));
      });
    });
  });
});
