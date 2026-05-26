import type { AssignmentResponse } from '@vedaai/shared-types';
import type { IAssignment } from '../models/Assignment';

export function mapAssignmentToResponse(doc: IAssignment): AssignmentResponse {
  return {
    id: doc._id.toString(),
    title: doc.title,
    dueDate: doc.dueDate.toISOString(),
    questionTypes: doc.questionTypes,
    questionCount: doc.questionCount,
    marksDistribution: doc.marksDistribution,
    totalMarks: doc.totalMarks,
    additionalInstructions: doc.additionalInstructions,
    uploadedFile: doc.uploadedFile ?? null,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
