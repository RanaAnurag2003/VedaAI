import { FileQuestion, Sparkles } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center px-8 text-center">
      {/* Glow orb */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl scale-150" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20">
          <FileQuestion className="h-12 w-12 text-purple-400/70" />
        </div>
      </div>

      {/* Dashed border box */}
      <div className="empty-state-border rounded-2xl px-8 py-10 max-w-sm w-full">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-semibold text-purple-300">AI-Powered Generation</span>
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-2">
          Your question paper will appear here
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Configure your assessment on the left and click{' '}
          <span className="text-purple-400 font-medium">Generate Question Paper</span>{' '}
          to create a structured exam with AI.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['MCQ', 'Short Answer', 'Long Answer', 'Fill Blanks', 'True/False'].map((f) => (
            <span
              key={f}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Steps hint */}
      <div className="mt-8 flex items-center gap-6 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500/50" />
          Configure
        </span>
        <span className="h-px w-8 bg-white/10" />
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500/50" />
          Generate
        </span>
        <span className="h-px w-8 bg-white/10" />
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500/50" />
          Download PDF
        </span>
      </div>
    </div>
  );
}
