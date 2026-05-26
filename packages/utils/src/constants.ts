export const QUEUE_NAMES = {
  ASSESSMENT_GENERATION: 'assessment-generation',
} as const;

export const REDIS_KEYS = {
  assignmentStatus: (id: string) => `assignment:${id}:status`,
} as const;

export const JOB_NAMES = {
  GENERATE_ASSESSMENT: 'generate-assessment',
} as const;

export const DIFFICULTY_DISTRIBUTION = {
  easy: 0.4,
  moderate: 0.4,
  hard: 0.2,
} as const;

export const MAX_SOURCE_TEXT_LENGTH = 50_000;

export const STATUS_TTL_SECONDS = 86_400;
