'use client';

import { use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { GenerationProgressTracker } from '@/components/assessment/GenerationProgress';
import { ExamPaper } from '@/components/assessment/ExamPaper';
import { ExamPaperSkeleton } from '@/components/assessment/ExamPaperSkeleton';
import { EmptyState } from '@/components/assessment/EmptyState';
import { DownloadPdfButton } from '@/components/assessment/DownloadPdfButton';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useSocket } from '@/hooks/useSocket';
import { useAssignmentDetail, useRegenerate } from '@/hooks/useAssignment';
import { ArrowLeft, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { loading } = useAssignmentDetail(id);
  useSocket(id);

  const paper = useAssignmentStore((s) => s.paper);
  const status = useAssignmentStore((s) => s.status);
  const assignment = useAssignmentStore((s) => s.assignment);
  const error = useAssignmentStore((s) => s.error);
  const { regenerate, regenerating } = useRegenerate(id);

  const toastedRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${status}-${error ?? ''}-${paper?.title ?? ''}`;
    if (toastedRef.current === key) return;

    if (status === 'failed' && error) {
      toast({ title: 'Generation failed', description: error, variant: 'destructive' });
      toastedRef.current = key;
    } else if (status === 'completed' && paper) {
      toast({ title: '✨ Success', description: 'Your question paper is ready!' });
      toastedRef.current = key;
    }
  }, [status, error, paper]);

  const isGenerating =
    status === 'queued' || status === 'processing' || status === 'generating' || regenerating;
  const showPaper = status === 'completed' && paper;

  return (
    <div
      className="min-h-screen bg-[#080E1A]"
      style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(108,92,231,0.08) 0%, transparent 55%)' }}
    >
      <Header />

      <div className="mx-auto max-w-screen-2xl px-4 py-8 md:px-8">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/assignments"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex gap-3">
            {(status === 'failed' || status === 'completed') && (
              <button
                onClick={regenerate}
                disabled={regenerating}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all duration-200 disabled:opacity-50"
              >
                {regenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate
              </button>
            )}
            {showPaper && <DownloadPdfButton paper={paper} />}
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Info panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Assignment info card */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">
                    {assignment?.title ?? 'Assessment'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {assignment?.questionCount ?? '—'} questions · {assignment?.totalMarks ?? '—'} marks
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                status === 'failed' ? 'bg-rose-500/15 text-rose-400' :
                'bg-purple-500/15 text-purple-400'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  status === 'completed' ? 'bg-emerald-400' :
                  status === 'failed' ? 'bg-rose-400' :
                  'bg-purple-400 animate-pulse'
                }`} />
                {status === 'completed' ? 'Completed' :
                 status === 'failed' ? 'Failed' :
                 status ? 'Generating...' : 'Pending'}
              </div>

              {/* Question types */}
              {assignment?.questionTypes && assignment.questionTypes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {assignment.questionTypes.map((type) => (
                    <span key={type} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Progress tracker */}
            <GenerationProgressTracker />

            {/* Error state */}
            {status === 'failed' && !error && (
              <div className="glass-card p-5 text-center">
                <p className="text-sm text-slate-400">Generation failed. Click Regenerate to try again.</p>
              </div>
            )}
          </div>

          {/* Right: Paper panel */}
          <div className="lg:col-span-3">
            {loading || isGenerating ? (
              <ExamPaperSkeleton />
            ) : showPaper ? (
              <ExamPaper
                paper={paper}
                totalMarks={assignment?.totalMarks}
                dueDate={assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : undefined}
              />
            ) : (
              <div className="glass-card overflow-hidden">
                <EmptyState />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
