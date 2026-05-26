import { z } from 'zod';
import { AssignmentStatusSchema } from './assignment';

export const GenerationStatusSchema = z.enum([
  'queued',
  'processing',
  'generating',
  'completed',
  'failed',
]);

export type GenerationStatus = z.infer<typeof GenerationStatusSchema>;

export const GenerationProgressSchema = z.object({
  status: GenerationStatusSchema,
  message: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
});

export type GenerationProgress = z.infer<typeof GenerationProgressSchema>;

export interface CreateAssignmentResponse {
  assignmentId: string;
  status: z.infer<typeof AssignmentStatusSchema>;
}
