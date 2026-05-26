import type { AssessmentSection } from '@vedaai/shared-types';
import { QuestionCard } from './QuestionCard';

interface SectionBlockProps {
  section: AssessmentSection;
  startNumber: number;
}

export function SectionBlock({ section, startNumber }: SectionBlockProps) {
  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white text-xs font-bold">
          {section.title.replace(/[^A-Z]/g, '') || section.title.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">{section.title}</h2>
          {section.instruction && (
            <p className="text-xs text-slate-500 mt-0.5">{section.instruction}</p>
          )}
        </div>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Questions */}
      <div className="space-y-4 pl-1">
        {section.questions.map((question, index) => (
          <QuestionCard
            key={index}
            question={question}
            number={startNumber + index}
          />
        ))}
      </div>
    </section>
  );
}
