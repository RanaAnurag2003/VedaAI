import { create } from 'zustand';
import type {
  AssessmentPaper,
  AssignmentResponse,
  GenerationProgress,
  GenerationStatus,
} from '@vedaai/shared-types';

interface AssignmentState {
  currentAssignmentId: string | null;
  assignment: AssignmentResponse | null;
  paper: AssessmentPaper | null;
  status: GenerationStatus | null;
  progressMessage: string;
  progressPercent: number;
  error: string | null;
  isSubmitting: boolean;
  setAssignmentId: (id: string) => void;
  setAssignment: (assignment: AssignmentResponse) => void;
  setPaper: (paper: AssessmentPaper | null) => void;
  setProgress: (progress: GenerationProgress) => void;
  setError: (error: string | null) => void;
  setIsSubmitting: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentAssignmentId: null,
  assignment: null,
  paper: null,
  status: null as GenerationStatus | null,
  progressMessage: '',
  progressPercent: 0,
  error: null,
  isSubmitting: false,
};

export const useAssignmentStore = create<AssignmentState>((set) => ({
  ...initialState,
  setAssignmentId: (id) => set({ currentAssignmentId: id }),
  setAssignment: (assignment) =>
    set({
      assignment,
      status: mapAssignmentStatus(assignment.status),
    }),
  setPaper: (paper) => set({ paper }),
  setProgress: (progress) =>
    set({
      status: progress.status,
      progressMessage: progress.message ?? '',
      progressPercent: progress.progress ?? 0,
      error: progress.error ?? null,
    }),
  setError: (error) => set({ error }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () => set(initialState),
}));

function mapAssignmentStatus(
  status: AssignmentResponse['status'],
): GenerationStatus | null {
  if (
    status === 'queued' ||
    status === 'processing' ||
    status === 'generating' ||
    status === 'completed' ||
    status === 'failed'
  ) {
    return status;
  }
  return null;
}
