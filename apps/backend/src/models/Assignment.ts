import mongoose, { Schema, Document, Types } from 'mongoose';
import type { AssignmentStatus, MarksDistribution, QuestionType } from '@vedaai/shared-types';

export interface IUploadedFile {
  originalName: string;
  mimeType: string;
  path: string;
  size: number;
}

export interface IAssignment extends Document {
  _id: Types.ObjectId;
  title: string;
  dueDate: Date;
  questionTypes: QuestionType[];
  questionCount: number;
  marksDistribution: MarksDistribution;
  totalMarks: number;
  additionalInstructions: string;
  uploadedFile?: IUploadedFile | null;
  sourceText?: string;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UploadedFileSchema = new Schema<IUploadedFile>(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false },
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [String], required: true },
    questionCount: { type: Number, required: true },
    marksDistribution: { type: Schema.Types.Mixed, required: true },
    totalMarks: { type: Number, required: true },
    additionalInstructions: { type: String, default: '' },
    uploadedFile: { type: UploadedFileSchema, default: null },
    sourceText: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'queued', 'processing', 'generating', 'completed', 'failed'],
      default: 'queued',
    },
  },
  { timestamps: true },
);

export const AssignmentModel = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
