import Redis from 'ioredis';
import { createLogger } from '@vedaai/utils';

const logger = createLogger('redis');

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

export async function connectRedis(url: string): Promise<Redis> {
  redisClient = new Redis(url, {
    maxRetriesPerRequest: null,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis error', { error: err.message });
  });

  await redisClient.ping();
  logger.info('Redis connected');
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
}

export function isRedisConnected(): boolean {
  return redisClient?.status === 'ready';
}
