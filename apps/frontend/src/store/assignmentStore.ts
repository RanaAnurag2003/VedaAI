import { create } from 'zustand';
import { parse } from 'partial-json';
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
  rawJsonString: string;
  isStreaming: boolean;
  setAssignmentId: (id: string) => void;
  setAssignment: (assignment: AssignmentResponse) => void;
  setPaper: (paper: AssessmentPaper | null) => void;
  setProgress: (progress: GenerationProgress) => void;
  setError: (error: string | null) => void;
  setIsSubmitting: (value: boolean) => void;
  appendChunk: (chunk: string) => void;
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
  rawJsonString: '',
  isStreaming: false,
};

export const useAssignmentStore = create<AssignmentState>((set) => ({
  ...initialState,
  setAssignmentId: (id) => set({ currentAssignmentId: id }),
  setAssignment: (assignment) =>
    set({
      assignment,
      status: mapAssignmentStatus(assignment.status),
    }),
  setPaper: (paper) => set({ paper, isStreaming: false, rawJsonString: '' }),
  setProgress: (progress) =>
    set({
      status: progress.status,
      progressMessage: progress.message ?? '',
      progressPercent: progress.progress ?? 0,
      error: progress.error ?? null,
    }),
  setError: (error) => set({ error }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  appendChunk: (chunk) => set((state) => {
    const newRaw = state.rawJsonString + chunk;
    let newPaper = state.paper;
    try {
      const parsed = parse(newRaw) as AssessmentPaper;
      newPaper = reconcilePaper(state.paper, parsed);
    } catch (e) {
      // Ignore parse errors on incomplete JSON
    }
    return { rawJsonString: newRaw, paper: newPaper, isStreaming: true };
  }),
  reset: () => set(initialState),
}));

function reconcilePaper(
  oldPaper: AssessmentPaper | null,
  newPaper: AssessmentPaper | null,
): AssessmentPaper | null {
  if (!oldPaper) return newPaper;
  if (!newPaper) return null;

  let paperChanged = false;

  const title = oldPaper.title === newPaper.title ? oldPaper.title : (paperChanged = true, newPaper.title);

  const oldSections = oldPaper.sections || [];
  const newSections = newPaper.sections || [];
  const sections: any[] = [];

  const maxSections = Math.max(oldSections.length, newSections.length);
  for (let i = 0; i < maxSections; i++) {
    const oldSec = oldSections[i];
    const newSec = newSections[i];

    if (!newSec) {
      paperChanged = true;
      continue;
    }
    if (!oldSec) {
      paperChanged = true;
      sections.push(newSec);
      continue;
    }

    let sectionChanged = false;
    const secTitle = oldSec.title === newSec.title ? oldSec.title : (sectionChanged = true, newSec.title);
    const secInstruction = oldSec.instruction === newSec.instruction ? oldSec.instruction : (sectionChanged = true, newSec.instruction);

    const oldQuestions = oldSec.questions || [];
    const newQuestions = newSec.questions || [];
    const questions: any[] = [];

    const maxQuestions = Math.max(oldQuestions.length, newQuestions.length);
    for (let j = 0; j < maxQuestions; j++) {
      const oldQ = oldQuestions[j];
      const newQ = newQuestions[j];

      if (!newQ) {
        sectionChanged = true;
        continue;
      }
      if (!oldQ) {
        sectionChanged = true;
        questions.push(newQ);
        continue;
      }

      const qChanged =
        oldQ.question !== newQ.question ||
        oldQ.type !== newQ.type ||
        oldQ.difficulty !== newQ.difficulty ||
        oldQ.marks !== newQ.marks ||
        ('blanks' in oldQ ? oldQ.blanks : undefined) !== ('blanks' in newQ ? newQ.blanks : undefined) ||
        JSON.stringify('options' in oldQ ? oldQ.options : undefined) !== JSON.stringify('options' in newQ ? newQ.options : undefined);

      if (qChanged) {
        sectionChanged = true;
        questions.push(newQ);
      } else {
        questions.push(oldQ);
      }
    }

    let finalQuestions = oldSec.questions;
    if (sectionChanged || oldQuestions.length !== questions.length) {
      finalQuestions = questions;
      sectionChanged = true;
    }

    if (sectionChanged) {
      paperChanged = true;
      sections.push({
        ...newSec,
        title: secTitle,
        instruction: secInstruction,
        questions: finalQuestions,
      });
    } else {
      sections.push(oldSec);
    }
  }

  let finalSections = oldPaper.sections;
  if (paperChanged || oldSections.length !== sections.length) {
    finalSections = sections;
    paperChanged = true;
  }

  if (paperChanged) {
    return {
      ...newPaper,
      title,
      sections: finalSections,
    };
  }

  return oldPaper;
}

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
