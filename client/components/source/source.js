import { Template } from 'meteor/templating';
import { SubsManager } from 'meteor/meteorhacks:subs-manager';

const subsManager = new SubsManager();

Template.component_source.onRendered(function rendered() {
  if (this.data.source) {
    this.subscribe('sourcesPlaceInfoCounts', this.data.source._id);
    this.subscribe('sourceImports.public');
  }
});
