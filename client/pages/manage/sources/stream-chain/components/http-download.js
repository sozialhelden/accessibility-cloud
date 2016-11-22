import { Template } from 'meteor/templating';

Template.sources_stream_chain_HTTPDownload.helpers({
  curlString() {
    const headers = this.parameters.headers;
    const headerParameters = headers && Object.keys(headers)
      .map(key => `-H '${key}: ${headers[key]}'`)
      .join(' ');

    return `curl -v -s ${headerParameters || ''} \\\n'${this.parameters.sourceUrl}'`;
  },
});
