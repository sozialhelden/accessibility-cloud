import { Events } from "../events";
import { Apps } from "../../apps/apps";
import { Organizations } from "../../organizations/organizations";
import { isAdmin } from "../../../lib/is-admin";
import { EventsPublicFields } from "./_fields";

// Events.visibleSelectorForUserId = () => ({});

// apis are open to everyone as currently all events are public in any way
// we will revisit this once our use case changes
Events.visibleSelectorForAppId = (appId) => {
  const app = Apps.findOne(appId, { transform: null });
  if (!app) return null;
  const { organizationId } = app;
  const selector = { organizationId, status: { $ne: 'draft' } };
  return selector;
};

Events.apiParameterizedSelector = ({ visibleContentSelector }) => visibleContentSelector;

Events.relationships = {
  belongsTo: {
    organization: {
      foreignCollection: Organizations,
      foreignKey: 'organizationId',
    },
  },
};

Events.publicFields = EventsPublicFields;