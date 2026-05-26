import type { Difficulty } from '@vedaai/shared-types';
import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const CONFIG: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'badge-easy' },
  moderate: { label: 'Moderate', className: 'badge-moderate' },
  hard: { label: 'Hard', className: 'badge-hard' },
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const { label, className } = CONFIG[difficulty] ?? CONFIG.moderate;
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', className)}>
      {label}
    </span>
  );
}
