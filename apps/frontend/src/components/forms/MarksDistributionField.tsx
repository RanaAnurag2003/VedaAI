'use client';

import { QuestionType, MarksDistribution } from '@vedaai/shared-types';

const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'MCQ',
  short_answer: 'Short Answer',
  long_answer: 'Long Answer',
  fill_blank: 'Fill in Blanks',
  true_false: 'True / False',
};

interface MarksDistributionFieldProps {
  questionTypes: QuestionType[];
  value: MarksDistribution;
  onChange: (marks: MarksDistribution) => void;
  error?: string;
}

export function MarksDistributionField({
  questionTypes,
  value,
  onChange,
  error,
}: MarksDistributionFieldProps) {
  if (questionTypes.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic">Select question types above to set marks per type.</p>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-widest text-purple-400">
        Marks Per Question Type <span className="text-rose-400">*</span>
      </label>
      <div className="grid gap-2.5">
        {questionTypes.map((type) => (
          <div
            key={type}
            className="flex items-center gap-4 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3"
          >
            <span className="flex-1 text-sm text-slate-300 font-medium">{TYPE_LABELS[type]}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={value[type] ?? 0}
                onChange={(e) =>
                  onChange({
                    ...value,
                    [type]: Number(e.target.value) || 0,
                  })
                }
                className="w-20 rounded-lg bg-[#0a1020] border border-white/10 text-slate-100 text-sm px-3 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
              <span className="text-xs text-slate-500 w-10">marks</span>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
