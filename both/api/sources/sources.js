import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { isAdmin } from '/both/lib/is-admin';

import { Licenses } from '/both/api/licenses/licenses';
import { Organizations } from '/both/api/organizations/organizations';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { isUserMemberOfOrganizationWithId } from '/both/api/organizations/privileges.js';

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
  isRequestable: {
    type: Boolean,
    label: 'Access to this data source can be requested',
    defaultValue: false,
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
  hasRunningImport: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
    },
  },
  placeInfoCount: {
    type: Number,
    defaultValue: 0,
    optional: true,
    autoform: {
      afFieldInput: {
        type: 'hidden',
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
  isFullyVisibleForUserId(userId) {
    return isAdmin(userId) || isUserMemberOfOrganizationWithId(userId, this.organizationId);
  },
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
  hasDownloadStep() {
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

if (Meteor.isServer) {
  SourceImports._ensureIndex({ licenseId: 1 });
  SourceImports._ensureIndex({ languageId: 1 });
  SourceImports._ensureIndex({ name: 1 });
  SourceImports._ensureIndex({ isFreelyAccessible: 1 });
  SourceImports._ensureIndex({ isDraft: 1 });
  SourceImports._ensureIndex({ accessRestrictedTo: 1 });
  SourceImports._ensureIndex({ organizationId: 1 });
}
