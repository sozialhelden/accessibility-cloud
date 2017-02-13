import fs from 'fs';
import vm from 'vm';
import path from 'path';
import getCategories from './get-categories';
import getHelpersContent from './get-helpers-content';

const LIBS_DIR_PATH = path.join(process.env.PWD, __dirname, 'libs');

const getLibsContent = () => {
  console.log(`LIBS_DIR_PATH: ${LIBS_DIR_PATH}`);
  const libsFilePaths = fs.readdirSync(LIBS_DIR_PATH);

  return libsFilePaths.reduce((content, fileName) => `
    ${content}
    ${fs.readFileSync(`${LIBS_DIR_PATH}/${fileName}`, {
      encoding: 'utf8',
    })}
  `, '');
};

export default function getContext() {
  const globalObject = Object.freeze({});
  const helpersContent = getHelpersContent();
  const categoriesJSON = JSON.stringify(getCategories());
  const helpersSetupScript = `
    ${getLibsContent()};
    var categoryIdForSynonyms = ${categoriesJSON};
    var helpers = ${helpersContent};
  `;
  const context = vm.createContext(globalObject);

  vm.runInContext(helpersSetupScript, context);

  return context;
}
