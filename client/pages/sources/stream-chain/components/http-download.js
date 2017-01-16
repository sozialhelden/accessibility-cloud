import { Template } from 'meteor/templating';
import { _ } from 'lodash';

Template.sources_stream_chain_HTTPDownload.helpers({
  curlString() {
    const { headers, sourceUrl } = (this.debugInfo && this.debugInfo.request) || this.parameters;
    const headerParameters = headers && _.chunk(headers, 2)
      .map(key => `-H '${key[0]}: ${key[1]}'`)
      .join(' ');

    return `curl -v -s ${headerParameters || ''} \\\n'${sourceUrl}'`;
  },
});
