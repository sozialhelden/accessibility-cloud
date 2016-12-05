import { Template } from 'meteor/templating';
import { SubsManager } from 'meteor/meteorhacks:subs-manager';

const subsManager = new SubsManager();

Template.component_source.onRendered(function rendered() {
  if (this.data.source) {
    subsManager.subscribe('sourcesPlaceInfoCounts', this.data.source._id);
    subsManager.subscribe('sourceImports.public');
  }
});
