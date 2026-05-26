'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AssignmentCreateSchema,
  type AssignmentCreateInput,
  type QuestionType,
  type MarksDistribution,
} from '@vedaai/shared-types';
import { FileDropzone } from './FileDropzone';
import { QuestionTypesField } from './QuestionTypesField';
import { MarksDistributionField } from './MarksDistributionField';
import { useAssignmentActions } from '@/hooks/useAssignment';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useState } from 'react';
import { Loader2, Sparkles, CalendarDays, Hash, Star, FileText, MessageSquare } from 'lucide-react';

const defaultMarks: MarksDistribution = {
  mcq: 1,
  short_answer: 2,
  long_answer: 5,
  fill_blank: 1,
  true_false: 1,
};

export function AssignmentForm() {
  const { submitAssignment } = useAssignmentActions();
  const isSubmitting = useAssignmentStore((s) => s.isSubmitting);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssignmentCreateInput>({
    resolver: zodResolver(AssignmentCreateSchema),
    defaultValues: {
      title: '',
      dueDate: '',
      questionTypes: [] as QuestionType[],
      questionCount: 10,
      marksDistribution: defaultMarks,
      totalMarks: 50,
      additionalInstructions: '',
    },
  });

  const questionTypes = watch('questionTypes');

  const onSubmit = async (data: AssignmentCreateInput) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('dueDate', data.dueDate);
    formData.append('questionTypes', JSON.stringify(data.questionTypes));
    formData.append('questionCount', String(data.questionCount));
    formData.append('marksDistribution', JSON.stringify(data.marksDistribution));
    formData.append('totalMarks', String(data.totalMarks));
    formData.append('additionalInstructions', data.additionalInstructions ?? '');
    if (file) formData.append('file', file);
    await submitAssignment(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
          <FileText className="h-3.5 w-3.5" />
          Assessment Title
        </label>
        <input
          id="title"
          placeholder="e.g. Mid Term Examination — Physics"
          className="input-dark"
          {...register('title')}
        />
        {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
      </div>

      {/* Due Date + Question Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            className="input-dark"
            {...register('dueDate')}
          />
          {errors.dueDate && <p className="text-xs text-rose-400 mt-1">{errors.dueDate.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
            <Hash className="h-3.5 w-3.5" />
            No. of Questions
          </label>
          <input
            id="questionCount"
            type="number"
            min={1}
            className="input-dark"
            {...register('questionCount', { valueAsNumber: true })}
          />
          {errors.questionCount && (
            <p className="text-xs text-rose-400 mt-1">{errors.questionCount.message}</p>
          )}
        </div>
      </div>

      {/* Total Marks */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
          <Star className="h-3.5 w-3.5" />
          Total Marks
        </label>
        <input
          id="totalMarks"
          type="number"
          min={1}
          className="input-dark"
          {...register('totalMarks', { valueAsNumber: true })}
        />
        {errors.totalMarks && (
          <p className="text-xs text-rose-400 mt-1">{errors.totalMarks.message}</p>
        )}
      </div>

      {/* File Upload */}
      <div className="section-divider" />
      <FileDropzone value={file} onChange={setFile} />

      {/* Question Types */}
      <div className="section-divider" />
      <Controller
        name="questionTypes"
        control={control}
        render={({ field }) => (
          <QuestionTypesField
            value={field.value}
            onChange={field.onChange}
            error={errors.questionTypes?.message}
          />
        )}
      />

      {/* Marks Distribution */}
      <Controller
        name="marksDistribution"
        control={control}
        render={({ field }) => (
          <MarksDistributionField
            questionTypes={questionTypes}
            value={field.value}
            onChange={field.onChange}
            error={errors.marksDistribution?.message}
          />
        )}
      />

      {/* Additional Instructions */}
      <div className="section-divider" />
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
          <MessageSquare className="h-3.5 w-3.5" />
          Additional Instructions <span className="normal-case text-slate-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="additionalInstructions"
          placeholder="Any special instructions for the AI to follow while generating questions..."
          rows={3}
          className="input-dark resize-none"
          {...register('additionalInstructions')}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        id="generate-btn"
        className="btn-glow relative mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:from-purple-500 hover:to-indigo-500"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating question paper...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Question Paper
          </>
        )}
      </button>
    </form>
  );
}
