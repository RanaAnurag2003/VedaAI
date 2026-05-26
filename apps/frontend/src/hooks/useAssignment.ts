'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import {
  createAssignment,
  getAssignment,
  getAssignmentStatus,
  regenerateAssignment,
} from '@/services/assignmentService';
import { getErrorMessage } from '@/services/api';

export function useAssignmentActions() {
  const router = useRouter();
  const { setAssignmentId, setProgress, setIsSubmitting, setError } = useAssignmentStore();

  const submitAssignment = useCallback(
    async (formData: FormData) => {
      setIsSubmitting(true);
      setError(null);
      setProgress({ status: 'queued', message: 'Submitting...', progress: 0 });

      try {
        const result = await createAssignment(formData);
        setAssignmentId(result.assignmentId);
        router.push(`/assignments/${result.assignmentId}`);
      } catch (err) {
        setError(getErrorMessage(err));
        setProgress({ status: 'failed', error: getErrorMessage(err) });
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, setAssignmentId, setProgress, setIsSubmitting, setError],
  );

  return { submitAssignment };
}

export function useAssignmentDetail(id: string) {
  const { setAssignment, setPaper, setProgress, setError } = useAssignmentStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [detail, status] = await Promise.all([
          getAssignment(id),
          getAssignmentStatus(id).catch(() => null),
        ]);
        if (!mounted) return;
        setAssignment(detail.assignment);
        setPaper(detail.paper ?? null);
        if (status) setProgress(status);
      } catch (err) {
        if (mounted) setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id, setAssignment, setPaper, setProgress, setError]);

  return { loading };
}

export function useRegenerate(id: string) {
  const { setProgress, setError, setPaper } = useAssignmentStore();
  const [regenerating, setRegenerating] = useState(false);

  const regenerate = useCallback(async () => {
    setRegenerating(true);
    setError(null);
    setPaper(null);
    setProgress({ status: 'queued', message: 'Regenerating...', progress: 0 });

    try {
      await regenerateAssignment(id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRegenerating(false);
    }
  }, [id, setProgress, setError, setPaper]);

  return { regenerate, regenerating };
}
