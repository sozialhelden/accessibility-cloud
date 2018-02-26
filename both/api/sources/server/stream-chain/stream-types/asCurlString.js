// @flow
import util from 'util';

export default function asCurlString(request) {
  console.log(util.inspect(request, { depth: 3, colors: true }));
  const { headers, url, body, method, gzip } = request;
  const headerParameters = Object.keys(headers)
    .map(key => `-H '${key}: ${headers[key]}'`)
    .join(' ');
  return `curl -X${method} -v -s ${headerParameters || ''} ${body ? `--data '${body.replace(/'/, '\\\'')}' ` : ''} '${url}'`;
}
