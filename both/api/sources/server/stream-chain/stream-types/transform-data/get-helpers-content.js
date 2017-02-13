import fs from 'fs';
import path from 'path';

const basePath = path.join(process.env.PWD, __dirname, 'helpers');
const SOURCE_FILE_REGEX = /\.js$/;
const FUNCTION_NAME_REGEX = /function\s+(\w+)\(.*\)\s*\{/;

const getFunctionNameAndContent = filePath => {
  const content = fs.readFileSync(filePath, {
    encoding: 'utf8',
  });
  const name = FUNCTION_NAME_REGEX.exec(content)[1];

  return { name, content };
};

const getDirContents = (dirPath) => {
  const entries = fs.readdirSync(dirPath);

  return entries.reduce((acc, entryName) => {
    const entryPath = `${dirPath}/${entryName}`;
    const isDir = fs.statSync(entryPath).isDirectory();

    if (isDir) {
      return Object.assign({}, acc, {
        entryName: getDirContents(entryPath),
      });
    }

    if (!SOURCE_FILE_REGEX.test(entryName)) {
      return null; // ignore non-js files
    }
    const { name, content } = getFunctionNameAndContent(entryPath);

    return Object.assign({}, acc, {
      [name]: content,
    });
  }, {});
};

const turnObjectIntoString = obj => `{
  ${Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const stringifiedValue = value instanceof Object ? turnObjectIntoString(value) : value;

    return `
      ${acc}
      ${key}: ${stringifiedValue},
    `;
  }, '')}
}`;

export default function getHelpersContent() {
  const helpersObj = getDirContents(basePath);
  return turnObjectIntoString(helpersObj);
}

