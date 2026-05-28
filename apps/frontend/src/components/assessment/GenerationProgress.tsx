'use client';

import { useAssignmentStore } from '@/store/assignmentStore';
import { cn } from '@/lib/utils';
import { Check, Loader2, AlertCircle, Sparkles, Server, Cpu, Database } from 'lucide-react';

const STEPS = [
  { key: 'queued', label: 'Queued', desc: 'Waiting in BullMQ background job queue', icon: Server },
  { key: 'processing', label: 'Processing', desc: 'Parsing documents and extracting source text', icon: Cpu },
  { key: 'generating', label: 'Generating', desc: 'AI generating class-appropriate questions and structured JSON', icon: Sparkles },
  { key: 'completed', label: 'Done', desc: 'Saving structured exam paper to database', icon: Database },
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
    <div className="bg-[#1E1F21] rounded-[24px] p-6 border border-white/[0.04] shadow-xl animate-fade-in-up w-full max-w-md mx-auto">
      {/* Real-time Status Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Assessment Status</h3>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            {isFailed ? 'Process terminated with errors' : isCompleted ? 'Completed successfully' : 'Real-time pipeline logs active'}
          </p>
        </div>
        {!isFailed && !isCompleted && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            {progressPercent}%
          </div>
        )}
      </div>

      {/* Vertical Animated Timeline */}
      <div className="relative pl-1">
        {/* Timeline main vertical line background */}
        <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-white/[0.06] rounded-full" />

        {/* Timeline active line tracker */}
        {!isFailed && (
          <div 
            className="absolute left-[19px] top-4 w-[2px] bg-gradient-to-b from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-700 ease-out" 
            style={{ 
              height: isCompleted ? 'calc(100% - 32px)' : `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%` 
            }}
          />
        )}

        <div className="space-y-8 relative">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isDone = !isFailed && (isCompleted || index < currentIndex);
            const isCurrent = step.key === status && !isFailed;
            const isPending = !isDone && !isCurrent;

            return (
              <div 
                key={step.key} 
                className={cn(
                  "flex items-start gap-4 transition-all duration-300",
                  isPending && "opacity-40"
                )}
              >
                {/* Node representation with custom glowing icon */}
                <div className="relative z-10">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-500",
                      isDone ? "bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]" :
                      isCurrent ? "bg-gradient-to-tr from-amber-500 to-orange-500 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] animate-pulse" :
                      "bg-[#1A202C] border-white/10 text-slate-500"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : isCurrent && !isCompleted ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <StepIcon className="h-4.5 w-4.5" />
                    )}
                  </div>

                  {/* Little pulsing indicator for current step */}
                  {isCurrent && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </div>

                {/* Step text content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-xs font-bold transition-colors duration-300",
                      isCurrent ? "text-amber-400" : isDone ? "text-emerald-400" : "text-slate-300"
                    )}>
                      {step.label}
                    </span>
                    {isCurrent && !isFailed && (
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                    {isCurrent && progressMessage ? progressMessage : step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress failure panel */}
      {isFailed && error && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 animate-shake">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wide">Error Logged</h4>
            <p className="text-[11px] text-rose-300/80 font-medium mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
