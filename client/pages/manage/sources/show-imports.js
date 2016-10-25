import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { PlaceInfos } from '/both/api/place-infos/place-infos.js';


import subsManager from '/client/lib/subs-manager';

Template.sources_show_imports_page.onCreated(() => {
  subsManager.subscribe('organizations.withContent.mine');
  subsManager.subscribe('sourceImports.public');

  const importId = FlowRouter.getParam('importId');
  if (importId) {
    subsManager.subscribe('placeInfosFromImport.public', importId);
  }
  window.SourceImports = SourceImports;	// FIXME: we don't need that only for debugging
});


Template.sources_show_header.helpers({
  source() {
    return Sources.findOne(FlowRouter.getParam('_id'));
  },
});

Template.sources_show_imports_page.events({
  'click .btn.js-start-import'(event) {
    event.preventDefault();

    Meteor.call('sources.startImport', FlowRouter.getParam('_id'), (err, result) => {
      if (err) {
        console.log(err);
      } else {
        FlowRouter.go('manage.sources.show.imports', {
          _id: FlowRouter.getParam('_id'),
          importId: result,
        });
      }
    });
  },
});

function getCurrentSource() {
  return Sources.findOne(FlowRouter.getParam('_id'));
}

Template.sources_show_imports_page.helpers({
  source: getCurrentSource,
  activeIfCurrentImport(sourceId) {
    return FlowRouter.getParam('importId') === sourceId ? 'active' : '';
  },
  sourceImports() {
    const selector = { sourceId: FlowRouter.getParam('_id') };
    const options = { sort: { startTimestamp: -1 } };
    return SourceImports.find(selector, options);
  },
  fileMetadata() {
    return {
      sourceId: FlowRouter.getParam('_id'),
    };
  },
  fileCallbacks() {
    function showError(message) {
      debugger
      console.error(message);
      alert(`Error while uploading: ${message}`);
    }
    return {
      onError(error) {
        showError(error.message || error.reason);
      },
      onUploaded(response) {
        if (!response.uploadedFile) {
          return showError('Server did not send uploaded file information.');
        }

        const source = getCurrentSource();
        if (!source) {
          return showError('Source not loaded yet. Can\'t set URL.');
        }

        const firstStream = source.streamChain && source.streamChain[0];
        if (!firstStream) {
          return showError('Source has no first stream chain element. Can\'t set URL.');
        }

        if (firstStream.type !== 'HTTPDownload') {
          return showError('First stream is no HTTP download stream. Can\'t set URL.');
        }

        Meteor.call(
          'updateDataURLForSource',
          source._id,
          response.uploadedFile.storageUrl,
          (error) => {
            if (error) {
              showError(error.message || error.reason);
              return;
            }
            Meteor.call('sources.startImport', source._id);
          }
        );

        return true;
      },
    };
  },
  sourceImport() {
    const selectedImport = SourceImports.findOne(FlowRouter.getParam('importId'));
    if (selectedImport) {
      return selectedImport;
    }
    return SourceImports.findOne({ sourceId: FlowRouter.getParam('_id') });
  },
  placesUpdatedCount() {
    const sourceImportId = FlowRouter.getParam('importId');

    return PlaceInfos.find({ sourceImportId }).count();
  },
  examplePlaceInfos() {
    const sourceImportId = FlowRouter.getParam('importId');
    return PlaceInfos.find({ sourceImportId }, { limit: 3 });
  },
});
