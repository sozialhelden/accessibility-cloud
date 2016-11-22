import { Template } from 'meteor/templating';

Template.sources_stream_chain_MultiHTTPDownload.helpers({
  curlString() {
    const headers = this.parameters.headers;
    const headerParameters = Object.keys(headers)
      .map(key => `-H '${key}: ${headers[key]}'`)
      .join(' ');

    return `curl -v -s \\\n${headerParameters} \\\n'${this.parameters.sourceUrl}'`;
  },
});
