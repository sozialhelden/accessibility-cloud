import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { isAdmin } from '/both/lib/is-admin';
import { ImportFlows } from '/both/api/import-flows/import-flows';
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
    return isAdmin(userId)
            || isUserMemberOfOrganizationWithId(userId, this.organizationId)
            || this.isFreelyAccessible;
  },
  isEditableBy(userId) {
    if (!userId) {
      return false;
    }
    return isAdmin(userId)
            || isUserMemberOfOrganizationWithId(userId, this.organizationId);
  },
  hasRestrictedAccessForUserId(userId) {
    const allowedOrganizationIDs = this.accessRestrictedTo || [];
    const userBelongsToAnAllowedOrganization = allowedOrganizationIDs.some(
      organizationId => isUserMemberOfOrganizationWithId(userId, organizationId)
    );

    return !this.isFreelyAccessible && userBelongsToAnAllowedOrganization;
  },
  isVisibleForUserId(userId) {
    return this.isFullyVisibleForUserId(userId) || this.hasRestrictedAccessForUserId(userId);
  },
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
  getLicense() {
    return Licenses.findOne(this.licenseId);
  },
  getLastSuccessfulImport() {
    return SourceImports
      .find({ sourceId: this._id, isFinished: true }, { sort: { startTimestamp: -1 } })
      .fetch()
      .find(i => (!i.hasError() && !i.isAborted()));
  },
  getLastSourceImport() {
    const sourceId = this._id;
    const latestImport = SourceImports.findOne({ sourceId }, { sort: { startTimestamp: -1 } });
    if (latestImport) {
      return latestImport;
    }
    return null;
  },
  getImportFlows() {
    return ImportFlows.find(
      { sourceId: this._id },
      { sort: { createdAt: 1 } }
    );
  },
  addImportFlow({
    name = 'Default',
    streams,
  }) {
    ImportFlows.insert({
      sourceId: this._id,
      name,
      streams,
      createdAt: Date.now(),
    });
  },
});
