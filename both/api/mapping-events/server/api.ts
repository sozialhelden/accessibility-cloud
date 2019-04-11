import { MappingEvents } from "../mapping-events";
import { Apps } from "../../apps/apps";
import { Organizations } from "../../organizations/organizations";
import { Images } from "../../images/images";
import { isAdmin } from "../../../lib/is-admin";
import { EventsPublicFields } from "./_fields";

// MappingEvents.visibleSelectorForUserId = () => ({});

// apis are open to everyone as currently all events are public in any way
// we will revisit this once our use case changes
MappingEvents.visibleSelectorForAppId = (appId) => {
  const app = Apps.findOne(appId, { transform: null });
  if (!app) return null;
  const { organizationId } = app;
  const selector = { organizationId, status: { $ne: 'draft' } };
  return selector;
};

MappingEvents.apiParameterizedSelector = ({ visibleContentSelector }) => visibleContentSelector;

MappingEvents.relationships = {
  belongsTo: {
    organization: {
      foreignCollection: Organizations,
      foreignKey: 'organizationId',
    },
  },
  hasMany: {
    images: {
      foreignCollection: Images,
      foreignKey: 'objectId',
    }
  }
};

MappingEvents.publicFields = EventsPublicFields;