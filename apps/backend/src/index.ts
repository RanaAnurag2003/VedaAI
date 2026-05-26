import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { connectDatabase, isDatabaseConnected } from './config/db';
import { connectRedis, isRedisConnected } from './config/redis';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { initSocketServer } from './sockets/generationSocket';
import { initGenerationQueue } from './queues/generationQueue';
import { startGenerationWorker } from './workers/generationWorker';
import { createLogger } from '@vedaai/utils';

const logger = createLogger('server');

async function bootstrap(): Promise<void> {
  await connectDatabase(env.MONGODB_URI);
  await connectRedis(env.REDIS_URL);

  const app = express();
  const server = http.createServer(app);

  initSocketServer(server);
  initGenerationQueue();
  startGenerationWorker();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      db: isDatabaseConnected(),
      redis: isRedisConnected(),
    });
  });

  app.use('/api', apiRoutes);
  app.use(errorHandler);

  server.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down...');
    server.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', { error: String(err) });
  process.exit(1);
});
