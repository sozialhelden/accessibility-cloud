import { Template } from 'meteor/templating';

import './attributes.html';
import subsManager from '/client/lib/subs-manager';

Template.sources_show_page_attributes.onCreated(function created() {
  this.autorun(() => {
    const source = Template.instance().data;
    const lastSuccessfulImport = source.getLastSuccessfulImport();
    const _id = lastSuccessfulImport && lastSuccessfulImport._id;
    if (_id) {
      subsManager.subscribe('sourceImports.attributeDistribution', _id);
    }
  });
});
