export type mappingEventStatusEnum =
  | 'draft'
  | 'planned'
  | 'ongoing'
  | 'completed'
  | 'canceled';

export const mappingEventStatusLabels = Object.freeze([
  { label: 'Draft', value: 'draft' },
  { label: 'Planned', value: 'planned' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Canceled', value: 'canceled' },
]) as ReadonlyArray<{ label: string; value: mappingEventStatusEnum; }>;

