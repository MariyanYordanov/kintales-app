// Relationship types — must match server enum exactly
export const RELATIONSHIP_TYPES = [
  'parent',
  'child',
  'spouse',
  'sibling',
  'step_parent',
  'step_child',
  'step_sibling',
  'adopted',
  'guardian',
];

// Relative statuses — must match server enum exactly
export const RELATIVE_STATUSES = ['ALIVE', 'DECEASED', 'MISSING', 'UNKNOWN'];

export const DEFAULT_STATUS = 'ALIVE';

// Date constraints
export const MIN_YEAR = 1700;
export const MAX_YEAR = 2100;

// Validation constraints
export const MIN_NAME_LENGTH = 2;
export const MAX_RELATIVE_NAME = 200;
export const MAX_RELATIVE_BIO = 2000;
