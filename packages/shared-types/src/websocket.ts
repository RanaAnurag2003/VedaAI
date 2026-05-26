import type { GenerationProgress } from './generation';

export const WS_EVENTS = {
  JOIN_ASSIGNMENT: 'join:assignment',
  GENERATION_QUEUED: 'generation:queued',
  GENERATION_PROGRESS: 'generation:progress',
  GENERATION_COMPLETED: 'generation:completed',
  GENERATION_FAILED: 'generation:failed',
} as const;

export interface JoinAssignmentPayload {
  assignmentId: string;
}

export interface GenerationQueuedPayload {
  assignmentId: string;
}

export interface GenerationProgressPayload extends GenerationProgress {
  assignmentId: string;
}

export interface GenerationCompletedPayload {
  assignmentId: string;
}

export interface GenerationFailedPayload {
  assignmentId: string;
  error: string;
}
