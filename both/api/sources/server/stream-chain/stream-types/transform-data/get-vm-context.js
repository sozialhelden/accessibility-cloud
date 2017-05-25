/* global Assets: true */

import vm from 'vm';
import getCategories from './get-categories';
import getHelpersContent from './get-helpers-content';

const AVAILABLE_LIBS = [
  'lodash.min.js',
  'lodash-inflection.js',
  'geodesy.js',
  'md5.js',
];

const getLibsContent = () =>
  AVAILABLE_LIBS
    .map(fileName => Assets.getText(`transform-libs/${fileName}`))
    .join(';\n');

export default function getVMContext() {
  const globalObject = Object.freeze({});
  const helpersContent = getHelpersContent();
  const categoriesJSON = JSON.stringify(getCategories());
  const helpersSetupScript = `
    'use strict';

    ${getLibsContent()};
    var categoryIdForSynonyms = ${categoriesJSON};
    var helpers = ${helpersContent};
  `;
  const context = vm.createContext(globalObject);

  vm.runInContext(helpersSetupScript, context);

  return context;
}
