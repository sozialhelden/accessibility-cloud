import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Licenses } from '/both/api/licenses/licenses';
import { Organizations } from '/both/api/organizations/organizations';
import { SourceImports } from '/both/api/source-imports/source-imports';

export const Sources = new Mongo.Collection('Sources');

Sources.schema = new SimpleSchema({
  organizationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
      afFormGroup: {
        label: false,
      },
    },
  },
  name: {
    label: 'Name',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. Places in Europe',
         autofocus: true,
      },
    },
    type: String,
  },
  shortName: {
    label: 'Short name for backlinks (should include your Organization)',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. ACME',
      },
    },
    type: String,
    max: 12,
  },
  licenseId: {
    label: 'License',
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  description: {
    label: 'Description',
    type: String,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. This source shares information about...',
        rows: 10,
      },
    },
    optional: true,
  },
  originWebsiteURL: {
    label: 'Web-site (optional)',
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. https://some.site.com/1234',
      },
    },
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  isDraft: {
    type: Boolean,
    label: 'Only a draft (content not available to people outside your organization)',
    defaultValue: true,
    optional: true,
  },
  streamChain: {
    type: Array,
    label: 'Stream chain setup',
    optional: true,
  },
  'streamChain.$': {
    type: Object,
    blackbox: true,
  },
  'streamChain.$.type': {
    type: String,
  },
  isFreelyAccessible: {
    type: Boolean,
    label: 'Data is available to everybody',
    defaultValue: true,
  },
  accessRestrictedTo: {
    type: [String],
    label: 'Data is available to everybody',
    defaultValue: [],
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
      afFormGroup: {
        label: false,
      },
    },
  },
});

Sources.attachSchema(Sources.schema);

Sources.relationships = {
  belongsTo: {
    license: {
      foreignCollection: Licenses,
      foreignKey: 'licenseId',
    },
  },
};

Sources.helpers({
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
  getLicense() {
    return Licenses.findOne(this.licenseId);
  },
  inputMimeType() {
    const downloadItem = _.find(this.streamChain, chainItem => chainItem.type === 'HTTPDownload');
    return (downloadItem && downloadItem.parameters && downloadItem.parameters.inputMimeType);
  },
  inputMimeTypeName() {
    switch (this.inputMimeType()) {
      case 'application/json': return 'JSON';
      case 'text/csv': return 'CSV';
      default: return '(Unknown format)';
    }
  },
  canBeImported() {
    // This should be using SimpleSchema validators on all mappings steps to validate the mappings.
    if (!this.streamChain) {
      return false;
    }
    const hasDownloadStep = !!this.streamChain.find((step) =>
      step.type === 'HTTPDownload' && !!step.parameters.sourceUrl);
    return hasDownloadStep;
  },
  getLastSuccessfulImport() {
    return SourceImports
      .find({ sourceId: this._id }, { sort: { startTimestamp: -1 } })
      .fetch()
      .find(i => (i.isFinished() && !i.hasError() && !i.isAborted()));
  },
});
