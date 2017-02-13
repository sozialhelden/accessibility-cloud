import { Template } from 'meteor/templating';

import './attributes.html';
import subsManager from '/client/lib/subs-manager';

Template.sources_show_page_attributes.onCreated(() => {
  const source = Template.instance().data;
  subsManager.subscribe('sourceImports.stats.public', source._id);
});
