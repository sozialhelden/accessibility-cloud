export type EventStatusEnum =
  | 'draft'
  | 'planned'
  | 'ongoing'
  | 'completed'
  | 'canceled';

export const eventStatusLabels = Object.freeze([
  { label: 'Draft', value: 'draft' },
  { label: 'Planned', value: 'planned' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Canceled', value: 'canceled' },
]) as ReadonlyArray<{ label: string; value: EventStatusEnum; }>;

