import { GenerationProgress } from '@vedaai/shared-types';
import { REDIS_KEYS, STATUS_TTL_SECONDS } from '@vedaai/utils';
import { getRedis } from '../config/redis';

export async function setAssignmentStatus(
  assignmentId: string,
  progress: GenerationProgress,
): Promise<void> {
  const redis = getRedis();
  await redis.set(
    REDIS_KEYS.assignmentStatus(assignmentId),
    JSON.stringify(progress),
    'EX',
    STATUS_TTL_SECONDS,
  );
}

export async function getAssignmentStatus(
  assignmentId: string,
): Promise<GenerationProgress | null> {
  const redis = getRedis();
  const raw = await redis.get(REDIS_KEYS.assignmentStatus(assignmentId));
  if (!raw) return null;
  return JSON.parse(raw) as GenerationProgress;
}
