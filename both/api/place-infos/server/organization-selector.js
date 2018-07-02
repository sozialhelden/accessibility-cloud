import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {Sources} from '../../sources/sources';

// Returns MongoDB query options for given request

export default function organizationFilterSelector(req) {
  const organizationQuery = _.pick(req.query, 'includeOrganizations', 'excludeOrganizations');

  const schema = new SimpleSchema({
    includeOrganizations: {
      type: String,
      optional: true
    },
    excludeOrganizations: {
      type: String,
      optional: true
    }
  });

  // Clean the data to remove whitespaces and have correct types
  schema.clean(organizationQuery);

  // Throw ValidationError if something is wrong
  schema.validate(organizationQuery);

  if (organizationQuery.includeOrganizations && organizationQuery.excludeOrganizations) {
    throw new Meteor.Error(422, 'You cannot use both `includeOrganizations` and `excludeOrganizations` parameters' +
        ' at the same time.');
  }

  if (!organizationQuery.includeOrganizations && !organizationQuery.excludeOrganizations) {
    return {};
  }

  const orgIds = (organizationQuery.includeOrganizations || organizationQuery.excludeOrganizations).split(',');
  // select all the sources of the given organizations
  const sourceIds = Sources.find({
    'organizationId': {
      $in: orgIds
    }
  }, {_id: 1})
    .fetch()
    .map(function (s) {
      return s._id;
    });

  if (organizationQuery.includeOrganizations) {
    return {
      'properties.sourceId': {
        $in: sourceIds
      }
    };
  }

  if (organizationQuery.excludeOrganizations) {
    return {
      'properties.sourceId': {
        $nin: sourceIds
      }
    };
  }

  return {};
}
