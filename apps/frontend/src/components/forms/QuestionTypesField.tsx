'use client';

import { QuestionType } from '@vedaai/shared-types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'mcq', label: 'MCQ', icon: '⊙' },
  { value: 'short_answer', label: 'Short Answer', icon: '✎' },
  { value: 'long_answer', label: 'Long Answer', icon: '≡' },
  { value: 'fill_blank', label: 'Fill Blanks', icon: '_' },
  { value: 'true_false', label: 'True / False', icon: '⇄' },
];

interface QuestionTypesFieldProps {
  value: QuestionType[];
  onChange: (types: QuestionType[]) => void;
  error?: string;
}

export function QuestionTypesField({ value, onChange, error }: QuestionTypesFieldProps) {
  const toggle = (type: QuestionType) => {
    if (value.includes(type)) {
      onChange(value.filter((t) => t !== type));
    } else {
      onChange([...value, type]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-widest text-purple-400">
        Question Types <span className="text-rose-400">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {QUESTION_TYPE_OPTIONS.map((opt) => {
          const isSelected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                'pill-option select-none',
                isSelected ? 'pill-option-active' : 'pill-option-inactive',
              )}
            >
              {isSelected && <Check className="h-3.5 w-3.5" />}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
