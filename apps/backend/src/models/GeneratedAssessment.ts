import mongoose, { Schema, Document, Types } from 'mongoose';
import type { AssessmentPaper, Difficulty } from '@vedaai/shared-types';

export interface IGeneratedAssessment extends Document {
  _id: Types.ObjectId;
  assignmentId: Types.ObjectId;
  paper: AssessmentPaper;
  metadata: {
    model: string;
    durationMs: number;
    difficultyBreakdown: Record<Difficulty, number>;
  };
  generatedAt: Date;
}

const GeneratedAssessmentSchema = new Schema<IGeneratedAssessment>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, unique: true },
    paper: { type: Schema.Types.Mixed, required: true },
    metadata: { type: Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

export const GeneratedAssessmentModel = mongoose.model<IGeneratedAssessment>(
  'GeneratedAssessment',
  GeneratedAssessmentSchema,
);
