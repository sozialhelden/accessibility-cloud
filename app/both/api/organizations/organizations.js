import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Sources } from '/both/api/sources/sources';
import { OrganizationMembers } from '/both/api/organization-members/organization-members';
import { Apps } from '/both/api/apps/apps';
import { countriesOfTheWorld } from '/both/lib/all-countries';
import { isAdmin } from '/both/lib/is-admin';
import {
  userHasFullAccessToOrganizationId,
  isUserMemberOfOrganizationWithId,
} from '/both/api/organizations/privileges';
import { _ } from 'lodash';

const ACCESS_REQUEST_APPROVING_ROLES = [
  'developer',
  'manager',
  'founder',
  'member',
];

export const Organizations = new Mongo.Collection('Organizations');

Organizations.schema = new SimpleSchema({
  name: {
    label: 'Name of company or individual',
    type: String,
    max: 1000,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. xyz123 Inc.',
      },
    },
  },
  address: {
    label: 'Address',
    type: String,
    max: 1000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. Adam-Riese-St. 27',
      },
    },
  },
  addressAdditional: {
    label: 'Address (Additional)',
    type: String,
    max: 1000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. 1st floor',
      },
    },
  },
  zipCode: {
    label: 'ZIP-Code',
    type: String,
    max: 1000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. 12345',
      },
    },
  },
  city: {
    label: 'City',
    type: String,
    optional: true,
    max: 100,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. Berlin',
      },
    },
  },
  country: {
    label: 'Country',
    type: String,
    optional: true,
    max: 100,
    autoform: {
      afFieldInput: {
        options: countriesOfTheWorld,
      },
    },
  },
  phoneNumber: {
    label: 'Phone number',
    type: String,
    max: 100,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. +49-30-123455667',
      },
    },
  },
  webSite: {
    label: 'Web-Site',
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    max: 1000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. https://xyz123.org',
      },
    },
  },
  description: {
    label: 'Short description (optional)',
    type: String,
    max: 2000,
    optional: true,
    autoform: {
      afFieldInput: {
        placeholder: 'e.g. XYZ123 Inc. is a mid-size company that is often referred to as a primary example for...',
        rows: 5,
      },
    },
  },
  tocForOrganizationsAccepted: {
    type: Boolean,
    autoform: {
      label: false,
      type: 'tos-checkbox',
    },
    allowedValues: [true],
  },
  isTransitAgency: {
    type: Boolean,
    optional: true,
    label: 'This organization is a transit agency',
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
    },
  },
  isTransitNetwork: {
    type: Boolean,
    optional: true,
    label: 'This organization is a transit authority',
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
    },
  },
  isPartOfGovernment: {
    type: Boolean,
    optional: true,
    label: 'This organization is a part of a government',
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
    },
  },
  partOfTransitNetworkId: {
    type: String,
    optional: true,
    label: 'To which transit authority does this organization belong?',
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
    },
  },
  branding: {
    type: Object,
    optional: true,
    blackbox: true,
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
    },
  },
});

Organizations.schema.messages({
  notAllowed: 'Sorry, but this is not a valid option.',
});

Organizations.helpers({
  editableBy(userId) {
    if (!userId) return false;
    check(userId, String);
    return userHasFullAccessToOrganizationId(userId, this._id);
  },
  isFullyVisibleForUserId(userId) {
    if (!userId) return false;
    return isAdmin(userId) || isUserMemberOfOrganizationWithId(userId, this._id);
  },
  getSources() {
    const sources = Sources.find({ organizationId: this._id }).fetch();
    return _.sortBy(_.sortBy(sources, (s) => -s.documentCount), 'isDraft');
  },
  getApps() {
    return Apps.find({ organizationId: this._id });
  },
  getMostAuthoritativeUserThatCanApproveAccessRequests() {
    for (const role of ACCESS_REQUEST_APPROVING_ROLES) {
      const result = OrganizationMembers.findOne({
        organizationId: this._id,
        role,
      });

      if (result) {
        return Meteor.users.findOne(result.userId);
      }
    }

    return null;
  },
});

Organizations.whereCurrentUserIsMember = () => {
  const userId = Meteor.userId();
  const options = { transform: null, fields: { organizationId: 1 } };
  const orgIds = OrganizationMembers.find({ userId }, options).fetch().map(m => m.organizationId);
  return Organizations.find({ _id: { $in: orgIds } });
};

Organizations.attachSchema(Organizations.schema);
