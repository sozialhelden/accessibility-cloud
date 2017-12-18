import { GlobalStats } from '../global-stats.js';
import { publishPublicFields } from '/server/publish';

publishPublicFields('globalStats', GlobalStats, () => ({}), { sort: { date: -1 } });
