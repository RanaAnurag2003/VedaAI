import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import {
  WS_EVENTS,
  type JoinAssignmentPayload,
  type GenerationQueuedPayload,
  type GenerationProgressPayload,
  type GenerationCompletedPayload,
  type GenerationFailedPayload,
} from '@vedaai/shared-types';
import { env } from '../config/env';
import { createLogger } from '@vedaai/utils';

const logger = createLogger('socket');

let io: SocketServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info('Client connected', { socketId: socket.id });

    socket.on(WS_EVENTS.JOIN_ASSIGNMENT, (payload: JoinAssignmentPayload) => {
      if (!payload?.assignmentId) return;
      const room = getRoomName(payload.assignmentId);
      socket.join(room);
      logger.info('Client joined room', { room, socketId: socket.id });
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id });
    });
  });

  return io;
}

function getRoomName(assignmentId: string): string {
  return `assignment:${assignmentId}`;
}

function emitToAssignment<T>(assignmentId: string, event: string, payload: T): void {
  if (!io) return;
  io.to(getRoomName(assignmentId)).emit(event, payload);
}

export function emitGenerationQueued(assignmentId: string): void {
  const payload: GenerationQueuedPayload = { assignmentId };
  emitToAssignment(assignmentId, WS_EVENTS.GENERATION_QUEUED, payload);
}

export function emitGenerationProgress(payload: GenerationProgressPayload): void {
  emitToAssignment(payload.assignmentId, WS_EVENTS.GENERATION_PROGRESS, payload);
}

export function emitGenerationCompleted(assignmentId: string): void {
  const payload: GenerationCompletedPayload = { assignmentId };
  emitToAssignment(assignmentId, WS_EVENTS.GENERATION_COMPLETED, payload);
}

export function emitGenerationFailed(assignmentId: string, error: string): void {
  const payload: GenerationFailedPayload = { assignmentId, error };
  emitToAssignment(assignmentId, WS_EVENTS.GENERATION_FAILED, payload);
}
