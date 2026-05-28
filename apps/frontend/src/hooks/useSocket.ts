'use client';

import { useEffect, useRef } from 'react';
import { WS_EVENTS } from '@vedaai/shared-types';
import type {
  GenerationCompletedPayload,
  GenerationFailedPayload,
  GenerationProgressPayload,
  GenerationQueuedPayload,
  GenerationChunkPayload,
} from '@vedaai/shared-types';
import { getSocket } from '@/lib/socket';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getAssignment, getAssignmentStatus } from '@/services/assignmentService';

export function useSocket(assignmentId: string | null) {
  const setProgress = useAssignmentStore((s) => s.setProgress);
  const setPaper = useAssignmentStore((s) => s.setPaper);
  const setAssignment = useAssignmentStore((s) => s.setAssignment);
  const setError = useAssignmentStore((s) => s.setError);
  const appendChunk = useAssignmentStore((s) => s.appendChunk);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    const socket = getSocket();
    socket.connect();

    const onQueued = (payload: GenerationQueuedPayload) => {
      if (payload.assignmentId !== assignmentId) return;
      setProgress({ status: 'queued', message: 'Queued for generation', progress: 5 });
    };

    const onProgress = (payload: GenerationProgressPayload) => {
      if (payload.assignmentId !== assignmentId) return;
      setProgress(payload);
    };

    const onCompleted = async (payload: GenerationCompletedPayload) => {
      if (payload.assignmentId !== assignmentId) return;
      setProgress({ status: 'completed', message: 'Generation complete', progress: 100 });
      try {
        const detail = await getAssignment(assignmentId);
        setAssignment(detail.assignment);
        setPaper(detail.paper ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
      }
    };

    const onFailed = (payload: GenerationFailedPayload) => {
      if (payload.assignmentId !== assignmentId) return;
      setProgress({ status: 'failed', error: payload.error, progress: 0 });
      setError(payload.error);
    };

    const onChunk = (payload: GenerationChunkPayload) => {
      if (payload.assignmentId !== assignmentId) return;
      appendChunk(payload.chunk);
    };

    socket.on(WS_EVENTS.GENERATION_QUEUED, onQueued);
    socket.on(WS_EVENTS.GENERATION_PROGRESS, onProgress);
    socket.on(WS_EVENTS.GENERATION_COMPLETED, onCompleted);
    socket.on(WS_EVENTS.GENERATION_FAILED, onFailed);
    socket.on(WS_EVENTS.GENERATION_CHUNK, onChunk);

    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(async () => {
        try {
          const status = await getAssignmentStatus(assignmentId);
          setProgress(status);
          if (status.status === 'completed') {
            const detail = await getAssignment(assignmentId);
            setAssignment(detail.assignment);
            setPaper(detail.paper ?? null);
          }
        } catch {
          /* ignore polling errors */
        }
      }, 3000);
    };

    socket.on('disconnect', startPolling);
    socket.on('connect', () => {
      socket.emit(WS_EVENTS.JOIN_ASSIGNMENT, { assignmentId });
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    });

    // Also join initially if already connected, or it will join on 'connect' event
    if (socket.connected) {
      socket.emit(WS_EVENTS.JOIN_ASSIGNMENT, { assignmentId });
    }

    return () => {
      socket.off(WS_EVENTS.GENERATION_QUEUED, onQueued);
      socket.off(WS_EVENTS.GENERATION_PROGRESS, onProgress);
      socket.off(WS_EVENTS.GENERATION_COMPLETED, onCompleted);
      socket.off(WS_EVENTS.GENERATION_FAILED, onFailed);
      socket.off(WS_EVENTS.GENERATION_CHUNK, onChunk);
      socket.off('disconnect', startPolling);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [assignmentId, setProgress, setPaper, setAssignment, setError]);
}
