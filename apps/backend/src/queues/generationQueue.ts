import { Queue } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '@vedaai/utils';
import { getRedis } from '../config/redis';
import { emitGenerationQueued } from '../sockets/generationSocket';

let generationQueue: Queue | null = null;

export function getGenerationQueue(): Queue {
  if (!generationQueue) {
    throw new Error('Generation queue not initialized');
  }
  return generationQueue;
}

export function initGenerationQueue(): Queue {
  const connection = getRedis();

  generationQueue = new Queue(QUEUE_NAMES.ASSESSMENT_GENERATION, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });

  return generationQueue;
}

export async function enqueueGeneration(assignmentId: string): Promise<void> {
  const queue = getGenerationQueue();
  await queue.add(JOB_NAMES.GENERATE_ASSESSMENT, { assignmentId });
  emitGenerationQueued(assignmentId);
}
