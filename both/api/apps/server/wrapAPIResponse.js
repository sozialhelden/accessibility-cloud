import { Apps } from '../apps.js';

Apps.wrapDocumentAPIResponse = ({ result, related }) => Object.assign({}, result, { related });
Apps.includePathsByDefault = ['appLinks'];
