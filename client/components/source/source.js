import { Template } from 'meteor/templating';
import { SubsManager } from 'meteor/meteorhacks:subs-manager';

Template.component_source.onRendered(function rendered() {
  if (this.data.source) {
    this.subscribe('sourceImports.public');
  }
});
