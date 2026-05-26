import { z } from 'zod';
import { QuestionTypeSchema } from './assessment';

export const MarksDistributionSchema = z.object({
  mcq: z.number().min(0).default(0),
  short_answer: z.number().min(0).default(0),
  long_answer: z.number().min(0).default(0),
  fill_blank: z.number().min(0).default(0),
  true_false: z.number().min(0).default(0),
});

export const AssignmentCreateSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200),
    dueDate: z.string().min(1, 'Due date is required'),
    questionTypes: z
      .array(QuestionTypeSchema)
      .min(1, 'Select at least one question type'),
    questionCount: z.coerce.number().int().positive('Question count must be greater than 0'),
    marksDistribution: MarksDistributionSchema,
    totalMarks: z.coerce.number().positive('Total marks must be greater than 0'),
    additionalInstructions: z.string().max(2000).optional().default(''),
  })
  .refine(
    (data) => {
      const selectedMarks = data.questionTypes.reduce(
        (sum, type) => sum + (data.marksDistribution[type] ?? 0),
        0,
      );
      return selectedMarks > 0;
    },
    { message: 'Marks distribution must have positive values for selected types', path: ['marksDistribution'] },
  );

export type AssignmentCreateInput = z.infer<typeof AssignmentCreateSchema>;
export type MarksDistribution = z.infer<typeof MarksDistributionSchema>;

export const AssignmentStatusSchema = z.enum([
  'draft',
  'queued',
  'processing',
  'generating',
  'completed',
  'failed',
]);

export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>;

export interface UploadedFileMeta {
  originalName: string;
  mimeType: string;
  path: string;
  size: number;
}

export interface AssignmentResponse {
  id: string;
  title: string;
  dueDate: string;
  questionTypes: z.infer<typeof QuestionTypeSchema>[];
  questionCount: number;
  marksDistribution: MarksDistribution;
  totalMarks: number;
  additionalInstructions: string;
  uploadedFile?: UploadedFileMeta | null;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}
