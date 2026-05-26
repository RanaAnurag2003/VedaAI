import type { AssessmentQuestion } from '@vedaai/shared-types';
import { DifficultyBadge } from './DifficultyBadge';

interface QuestionCardProps {
  question: AssessmentQuestion;
  number: number;
}

export function QuestionCard({ question, number }: QuestionCardProps) {
  const hasOptions = question.type === 'mcq' && question.options && question.options.length > 0;
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="group rounded-xl border border-slate-100 bg-white p-5 hover:border-slate-200 transition-colors duration-200 shadow-sm">
      {/* Question Header */}
      <div className="flex items-start gap-3">
        {/* Number badge */}
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 mt-0.5">
          {number}
        </span>

        <div className="flex-1 min-w-0">
          {/* Question text */}
          <p className="text-sm text-slate-800 leading-relaxed font-medium">{question.question}</p>

          {/* MCQ Options */}
          {hasOptions && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {question.options!.map((option, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <span className="text-xs font-bold text-purple-600 flex-shrink-0 mt-0.5">
                    {optionLabels[i]}.
                  </span>
                  <span className="text-xs text-slate-700">{option}</span>
                </div>
              ))}
            </div>
          )}

          {/* Fill blank answer line */}
          {question.type === 'fill_blank' && (
            <div className="mt-3 border-b-2 border-dashed border-slate-300 pb-1 w-48" />
          )}

          {/* True/False options */}
          {question.type === 'true_false' && (
            <div className="mt-3 flex gap-4">
              {['True', 'False'].map((opt) => (
                <div
                  key={opt}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-1.5"
                >
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-400" />
                  <span className="text-xs text-slate-700">{opt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side badges */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2 ml-2">
          <span className="text-xs font-bold text-slate-900 bg-slate-100 rounded-full px-2.5 py-1">
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </span>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>

      {/* Short/Long answer lines */}
      {(question.type === 'short_answer' || question.type === 'long_answer') && (
        <div className="mt-4 ml-10 space-y-2">
          {Array.from({ length: question.type === 'long_answer' ? 5 : 2 }).map((_, i) => (
            <div key={i} className="border-b border-slate-200 pb-1" />
          ))}
        </div>
      )}
    </div>
  );
}
