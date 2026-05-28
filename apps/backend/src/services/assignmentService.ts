import fs from 'fs/promises';
import {
  AssignmentCreateSchema,
  type AssignmentCreateInput,
  type AssignmentDetailResponse,
  type CreateAssignmentResponse,
  type AssignmentResponse,
} from '@vedaai/shared-types';
import { AssignmentModel, type IAssignment, type IUploadedFile } from '../models/Assignment';
import { GeneratedAssessmentModel } from '../models/GeneratedAssessment';
import { AppError } from '../middleware/errorHandler';
import { mapAssignmentToResponse } from '../utils/mapAssignment';
import { setAssignmentStatus } from './cacheService';
import { enqueueGeneration } from '../queues/generationQueue';
import { extractTextFromFile } from './fileService';

export async function createAssignment(
  body: Record<string, unknown>,
  file?: Express.Multer.File,
): Promise<CreateAssignmentResponse> {
  const parsedFields = parseFormBody(body);
  const data = AssignmentCreateSchema.parse(parsedFields);

  let uploadedFile: IUploadedFile | null = null;
  let sourceText = '';

  if (file) {
    uploadedFile = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      path: file.path,
      size: file.size,
    };
    sourceText = await extractTextFromFile(uploadedFile);
  }

  const assignment = await AssignmentModel.create({
    title: data.title,
    dueDate: new Date(data.dueDate),
    questionTypes: data.questionTypes,
    questionCount: data.questionCount,
    marksDistribution: data.marksDistribution,
    totalMarks: data.totalMarks,
    additionalInstructions: data.additionalInstructions,
    uploadedFile,
    sourceText,
    status: 'queued',
  });

  await setAssignmentStatus(assignment._id.toString(), {
    status: 'queued',
    message: 'Assignment queued for generation',
    progress: 0,
  });

  await enqueueGeneration(assignment._id.toString());

  return {
    assignmentId: assignment._id.toString(),
    status: 'queued',
  };
}

export async function getAssignmentById(id: string): Promise<AssignmentDetailResponse> {
  const assignment = await AssignmentModel.findById(id);
  if (!assignment) {
    throw new AppError(404, 'Assignment not found');
  }

  const generated = await GeneratedAssessmentModel.findOne({ assignmentId: assignment._id });

  return {
    assignment: mapAssignmentToResponse(assignment),
    paper: generated?.paper ?? null,
  };
}

export async function regenerateAssignment(id: string): Promise<CreateAssignmentResponse> {
  const assignment = await AssignmentModel.findById(id);
  if (!assignment) {
    throw new AppError(404, 'Assignment not found');
  }

  await GeneratedAssessmentModel.deleteOne({ assignmentId: assignment._id });

  assignment.status = 'queued';
  await assignment.save();

  await setAssignmentStatus(id, {
    status: 'queued',
    message: 'Regeneration queued',
    progress: 0,
  });

  await enqueueGeneration(id);

  return { assignmentId: id, status: 'queued' };
}

function parseFormBody(body: Record<string, unknown>): AssignmentCreateInput {
  let questionTypes: unknown = body.questionTypes;
  if (typeof body.questionTypes === 'string') {
    try {
      questionTypes = JSON.parse(body.questionTypes);
    } catch {
      // fallback: attempt to parse simple comma-separated list like "mcq,short_answer"
      questionTypes = body.questionTypes
        .replace(/\[|\]|\"/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  let marksDistribution: unknown = body.marksDistribution;
  if (typeof body.marksDistribution === 'string') {
    const raw = (body.marksDistribution as string).trim();
    try {
      marksDistribution = JSON.parse(raw);
    } catch {
      try {
        // try single-quoted JSON
        const normalized = raw.replace(/(^'|'$)/g, '');
        marksDistribution = JSON.parse(normalized);
      } catch {
        // fallback: parse simple key:value pairs like {mcq:2, short_answer:8} or "mcq:2,short_answer:8"
        try {
          const stripped = raw.replace(/^\{|\}$/g, '').trim();
          const obj: Record<string, number> = {};
          if (stripped) {
            stripped.split(',').forEach((part) => {
              const [k, v] = part.split(':').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
              if (k) obj[k] = Number(v);
            });
          }
          marksDistribution = obj;
        } catch {
          marksDistribution = body.marksDistribution;
        }
      }
    }
  }

  return {
    title: String(body.title ?? ''),
    dueDate: String(body.dueDate ?? ''),
    questionTypes,
    questionCount: typeof body.questionCount === 'string' ? Number(body.questionCount) : body.questionCount,
    marksDistribution,
    totalMarks: typeof body.totalMarks === 'string' ? Number(body.totalMarks) : body.totalMarks,
    additionalInstructions: body.additionalInstructions
      ? String(body.additionalInstructions)
      : '',
  } as AssignmentCreateInput;
}

export async function updateAssignmentStatus(
  id: string,
  status: IAssignment['status'],
): Promise<void> {
  await AssignmentModel.findByIdAndUpdate(id, { status });
}

export async function listAssignments(): Promise<AssignmentResponse[]> {
  const docs = await AssignmentModel.find().sort({ createdAt: -1 });
  return docs.map(mapAssignmentToResponse);
}

export async function deleteAssignment(id: string): Promise<void> {
  const assignment = await AssignmentModel.findById(id);
  if (!assignment) {
    throw new AppError(404, 'Assignment not found');
  }

  // Delete generated assessment
  await GeneratedAssessmentModel.deleteOne({ assignmentId: assignment._id });

  // Delete local file if it exists
  if (assignment.uploadedFile?.path) {
    try {
      await fs.unlink(assignment.uploadedFile.path);
    } catch {
      // ignore unlink errors if file doesn't exist
    }
  }

  await AssignmentModel.findByIdAndDelete(id);
}

export async function updateAssignmentPaper(
  id: string,
  paper: any,
): Promise<any> {
  const generated = await GeneratedAssessmentModel.findOne({ assignmentId: id });
  if (!generated) {
    throw new AppError(404, 'Generated paper not found');
  }

  // Calculate difficulty breakdown
  const breakdown: Record<string, number> = {
    easy: 0,
    moderate: 0,
    hard: 0,
  };

  for (const section of paper.sections || []) {
    for (const q of section.questions || []) {
      if (q && q.difficulty) {
        const diff = q.difficulty.toLowerCase();
        if (diff === 'easy') breakdown.easy++;
        else if (diff === 'moderate' || diff === 'medium') breakdown.moderate++;
        else if (diff === 'hard') breakdown.hard++;
      }
    }
  }

  generated.paper = paper;
  generated.metadata = {
    ...generated.metadata,
    difficultyBreakdown: breakdown as any,
  };
  
  generated.markModified('paper');
  generated.markModified('metadata');
  await generated.save();

  return generated.paper;
}

