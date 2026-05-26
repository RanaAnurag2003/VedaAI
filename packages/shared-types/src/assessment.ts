import { z } from 'zod';
import type { AssignmentResponse } from './assignment';

export const QuestionTypeSchema = z.enum([
  'mcq',
  'short_answer',
  'long_answer',
  'fill_blank',
  'true_false',
]);

export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const DifficultySchema = z.enum(['easy', 'moderate', 'hard']);

export type Difficulty = z.infer<typeof DifficultySchema>;

export const McqQuestionSchema = z.object({
  question: z.string().min(1),
  type: z.literal('mcq'),
  difficulty: DifficultySchema,
  marks: z.number().positive(),
  options: z.array(z.string().min(1)).min(2).max(6),
});

export const ShortAnswerQuestionSchema = z.object({
  question: z.string().min(1),
  type: z.literal('short_answer'),
  difficulty: DifficultySchema,
  marks: z.number().positive(),
});

export const LongAnswerQuestionSchema = z.object({
  question: z.string().min(1),
  type: z.literal('long_answer'),
  difficulty: DifficultySchema,
  marks: z.number().positive(),
});

export const FillBlankQuestionSchema = z.object({
  question: z.string().min(1),
  type: z.literal('fill_blank'),
  difficulty: DifficultySchema,
  marks: z.number().positive(),
  blanks: z.number().int().positive().optional(),
});

export const TrueFalseQuestionSchema = z.object({
  question: z.string().min(1),
  type: z.literal('true_false'),
  difficulty: DifficultySchema,
  marks: z.number().positive(),
});

export const AssessmentQuestionSchema = z.discriminatedUnion('type', [
  McqQuestionSchema,
  ShortAnswerQuestionSchema,
  LongAnswerQuestionSchema,
  FillBlankQuestionSchema,
  TrueFalseQuestionSchema,
]);

export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;

export const AssessmentSectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(AssessmentQuestionSchema).min(1),
});

export type AssessmentSection = z.infer<typeof AssessmentSectionSchema>;

export const AssessmentPaperSchema = z.object({
  title: z.string().min(1),
  sections: z.array(AssessmentSectionSchema).min(1),
});

export type AssessmentPaper = z.infer<typeof AssessmentPaperSchema>;

export interface GeneratedAssessmentResponse {
  assignmentId: string;
  paper: AssessmentPaper;
  metadata: {
    model: string;
    durationMs: number;
    difficultyBreakdown: Record<Difficulty, number>;
  };
  generatedAt: string;
}

export interface AssignmentDetailResponse {
  assignment: AssignmentResponse;
  paper?: AssessmentPaper | null;
}
