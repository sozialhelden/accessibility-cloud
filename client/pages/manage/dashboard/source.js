import { Template } from 'meteor/templating';
import subsManager from '/client/lib/subs-manager';

Template.page_dashboard_source.onCreated(function created() {
  this.autorun((computation) => {
    if (this.data._id) {
      console.log('Subscribing to count for source', this.data._id);
      this.subscribe('sourcesPlaceInfoCounts', this.data._id);
      computation.stop();
    }
  });
});
