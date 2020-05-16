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


// prefetch the static content to not load on each new vm creation
const helpersContent = getHelpersContent();
const libContent = getLibsContent();

export default function getVMContext() {
  const globalObject = Object.freeze({});
  const categoriesJSON = JSON.stringify(getCategories());
  const helpersSetupScript = `
    'use strict';
    ${libContent};
    var categoryIdForSynonyms = ${categoriesJSON};
    var helpers = ${helpersContent};
  `;

  const context = vm.createContext(globalObject);
  vm.runInContext(helpersSetupScript, context);
  return context;
}
