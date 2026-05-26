import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES, createLogger } from '@vedaai/utils';
import { getRedis } from '../config/redis';
import { AssignmentModel } from '../models/Assignment';
import { GeneratedAssessmentModel } from '../models/GeneratedAssessment';
import { setAssignmentStatus } from '../services/cacheService';
import { updateAssignmentStatus } from '../services/assignmentService';
import { generateAssessmentPaper } from '../services/ai/openaiService';
import {
  emitGenerationProgress,
  emitGenerationCompleted,
  emitGenerationFailed,
} from '../sockets/generationSocket';
import type { GenerationStatus } from '@vedaai/shared-types';

const logger = createLogger('generation-worker');

interface JobData {
  assignmentId: string;
}

export function startGenerationWorker(): Worker {
  const worker = new Worker<JobData>(
    QUEUE_NAMES.ASSESSMENT_GENERATION,
    async (job: Job<JobData>) => {
      const { assignmentId } = job.data;
      logger.info('Processing job', { assignmentId, jobId: job.id });

      const assignment = await AssignmentModel.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment ${assignmentId} not found`);
      }

      await progress(assignmentId, 'processing', 'Processing assignment', 20);
      await updateAssignmentStatus(assignmentId, 'processing');

      await progress(assignmentId, 'generating', 'Generating questions with AI', 50);
      await updateAssignmentStatus(assignmentId, 'generating');

      const result = await generateAssessmentPaper(assignment);

      await GeneratedAssessmentModel.findOneAndUpdate(
        { assignmentId: assignment._id },
        {
          assignmentId: assignment._id,
          paper: result.paper,
          metadata: result.metadata,
          generatedAt: new Date(),
        },
        { upsert: true, new: true },
      );

      assignment.status = 'completed';
      await assignment.save();

      await progress(assignmentId, 'completed', 'Assessment generated successfully', 100);
      emitGenerationCompleted(assignmentId);

      logger.info('Job completed', { assignmentId, jobId: job.id });
    },
    {
      connection: getRedis(),
      concurrency: 2,
    },
  );

  worker.on('failed', async (job, err) => {
    const assignmentId = job?.data?.assignmentId;
    if (!assignmentId) return;

    logger.error('Job failed', {
      assignmentId,
      jobId: job?.id,
      error: err.message,
      stack: err.stack,
    });

    await updateAssignmentStatus(assignmentId, 'failed');
    await setAssignmentStatus(assignmentId, {
      status: 'failed',
      error: `${err.message}${err.stack ? '\n' + err.stack : ''}`,
      progress: 0,
    });

    emitGenerationFailed(assignmentId, `${err.message}${err.stack ? '\n' + err.stack : ''}`);
  });

  logger.info('Generation worker started');
  return worker;
}

async function progress(
  assignmentId: string,
  status: GenerationStatus,
  message: string,
  progressPercent: number,
): Promise<void> {
  await setAssignmentStatus(assignmentId, {
    status,
    message,
    progress: progressPercent,
  });

  emitGenerationProgress({
    assignmentId,
    status,
    message,
    progress: progressPercent,
  });
}
