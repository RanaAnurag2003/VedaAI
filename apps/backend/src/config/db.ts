import mongoose from 'mongoose';
import { createLogger } from '@vedaai/utils';

const logger = createLogger('db');

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
