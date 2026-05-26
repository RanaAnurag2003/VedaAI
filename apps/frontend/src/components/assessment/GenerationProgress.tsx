'use client';

import { useAssignmentStore } from '@/store/assignmentStore';
import { cn } from '@/lib/utils';
import { Check, Loader2, AlertCircle, Zap } from 'lucide-react';

const STEPS = [
  { key: 'queued', label: 'Queued', desc: 'Waiting in queue' },
  { key: 'processing', label: 'Processing', desc: 'Reading assignment' },
  { key: 'generating', label: 'Generating', desc: 'AI creating questions' },
  { key: 'completed', label: 'Complete', desc: 'Paper ready!' },
] as const;

export function GenerationProgressTracker() {
  const status = useAssignmentStore((s) => s.status);
  const progressMessage = useAssignmentStore((s) => s.progressMessage);
  const progressPercent = useAssignmentStore((s) => s.progressPercent);
  const error = useAssignmentStore((s) => s.error);

  if (!status) return null;

  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const isFailed = status === 'failed';
  const isCompleted = status === 'completed';

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          isFailed ? 'bg-rose-500/20' : 'bg-purple-500/20'
        )}>
          {isFailed ? (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          ) : (
            <Zap className={cn('h-4 w-4 text-purple-400', !isCompleted && 'animate-pulse')} />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            {isFailed ? 'Generation Failed' : isCompleted ? 'Assessment Ready!' : 'Generating Assessment...'}
          </h3>
          {progressMessage && !isFailed && (
            <p className="text-xs text-slate-500 mt-0.5">{progressMessage}</p>
          )}
        </div>
        {!isFailed && !isCompleted && (
          <span className="ml-auto text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
            {progressPercent}%
          </span>
        )}
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1 mb-5">
        {STEPS.map((step, index) => {
          const isDone = !isFailed && index < currentIndex;
          const isCurrent = step.key === status && !isFailed;
          const isActive = isDone || isCurrent;

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center gap-2">
              {/* Connector line before */}
              <div className="flex w-full items-center gap-1">
                {index > 0 && (
                  <div className={cn(
                    'flex-1 h-px transition-all duration-500',
                    isDone || isCurrent ? 'bg-purple-500' : 'bg-white/10'
                  )} />
                )}
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300',
                    isDone ? 'progress-step-done border-purple-500' :
                    isCurrent ? 'progress-step-active border-purple-500 animate-pulse-glow' :
                    'progress-step-inactive'
                  )}
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isCurrent && !isCompleted ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isCompleted && step.key === 'completed' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    'flex-1 h-px transition-all duration-500',
                    isDone ? 'bg-purple-500' : 'bg-white/10'
                  )} />
                )}
              </div>
              <span className={cn(
                'text-xs text-center transition-colors duration-300',
                isActive ? 'text-purple-300 font-medium' : 'text-slate-600'
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            isFailed ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500',
          )}
          style={{ width: `${isFailed ? 100 : progressPercent}%` }}
        />
      </div>

      {/* Error */}
      {isFailed && error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}
    </div>
  );
}
