'use client';

import { useState } from 'react';
import { useAssignmentActions } from '@/hooks/useAssignment';
import { useAssignmentStore } from '@/store/assignmentStore';
import {
  Loader2,
  Calendar,
  Upload,
  Plus,
  X,
  Mic
} from 'lucide-react';
import type { QuestionType } from '@vedaai/shared-types';

interface Row {
  type: QuestionType;
  count: number;
  marks: number;
}

const FRIENDLY_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short_answer', label: 'Short Questions' },
  { value: 'long_answer', label: 'Diagram/Graph-Based Questions' },
  { value: 'fill_blank', label: 'Numerical Problems' },
  { value: 'true_false', label: 'True or False' },
];

export function AssignmentForm() {
  const { submitAssignment } = useAssignmentActions();
  const isSubmitting = useAssignmentStore((s) => s.isSubmitting);

  // Form states matching screenshot defaults
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('8th');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechObj) {
      alert("Voice input is not supported in this browser. Please try Chrome, Safari, or Edge.");
      return;
    }
    const recognition = new SpeechObj();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setAdditionalInstructions((prev) => prev ? prev + ' ' + text : text);
    };

    recognition.start();
  };

  // Initial table rows exactly matching screenshot values
  const [rows, setRows] = useState<Row[]>([
    { type: 'mcq', count: 4, marks: 1 },
    { type: 'short_answer', count: 3, marks: 2 },
    { type: 'long_answer', count: 5, marks: 5 },
    { type: 'fill_blank', count: 5, marks: 5 },
  ]);

  // Derived calculations
  const totalQuestions = rows.reduce((sum, r) => sum + r.count, 0);
  const totalMarks = rows.reduce((sum, r) => sum + (r.count * r.marks), 0);

  // Counter Handlers
  const handleIncrementCount = (index: number) => {
    const updated = [...rows];
    updated[index].count += 1;
    setRows(updated);
  };

  const handleDecrementCount = (index: number) => {
    const updated = [...rows];
    if (updated[index].count > 1) {
      updated[index].count -= 1;
      setRows(updated);
    }
  };

  const handleIncrementMarks = (index: number) => {
    const updated = [...rows];
    updated[index].marks += 1;
    setRows(updated);
  };

  const handleDecrementMarks = (index: number) => {
    const updated = [...rows];
    if (updated[index].marks > 1) {
      updated[index].marks -= 1;
      setRows(updated);
    }
  };

  const handleTypeChange = (index: number, newType: QuestionType) => {
    const updated = [...rows];
    updated[index].type = newType;
    setRows(updated);
  };

  const handleAddRow = () => {
    // Add new row default
    setRows([...rows, { type: 'mcq', count: 5, marks: 1 }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  // Form submit bridging rows to Zod API schema
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map unique selected types
    const questionTypes = Array.from(new Set(rows.map((r) => r.type)));

    // Map marks distribution map
    const marksDistribution: Record<string, number> = {
      mcq: 1,
      short_answer: 2,
      long_answer: 5,
      fill_blank: 1,
      true_false: 1,
    };
    rows.forEach((r) => {
      marksDistribution[r.type] = r.marks;
    });

    const baseTitle = title.trim() || (file ? file.name.replace(/\.[^/.]+$/, '') : 'Assessment');
    const calculatedTitle = `${baseTitle} (Class: ${studentClass})`;

    const finalInstructions = `${additionalInstructions}\n[SYSTEM NOTE: Please generate class-appropriate academic questions tailored specifically for Grade/Class ${studentClass} students.]`;

    const formData = new FormData();
    formData.append('title', calculatedTitle);
    formData.append('dueDate', dueDate || new Date().toISOString().split('T')[0]);
    formData.append('questionTypes', JSON.stringify(questionTypes));
    formData.append('questionCount', String(totalQuestions));
    formData.append('marksDistribution', JSON.stringify(marksDistribution));
    formData.append('totalMarks', String(totalMarks));
    formData.append('additionalInstructions', finalInstructions);
    if (file) formData.append('file', file);

    await submitAssignment(formData);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8 bg-[#F9FAFB] rounded-[24px] p-6 border border-slate-100/50 shadow-sm">
      {/* Title Header inside form */}
      <div>
        <h2 className="text-base font-bold text-slate-800 tracking-wide">Assignment Details</h2>
        <p className="text-[11px] text-slate-400 font-medium">Basic information about your assignment</p>
      </div>

      {/* Cloud File Dropzone Area */}
      <div className="space-y-2">
        <div className="border-dashed border-2 border-slate-200 hover:border-[#6C5CE7] bg-white rounded-2xl p-6 text-center transition-all cursor-pointer relative flex flex-col items-center justify-center min-h-[160px]">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 mb-3 shadow-sm">
            <Upload className="h-5 w-5 text-slate-400" />
          </div>
          <span className="text-xs font-bold text-slate-700">Choose a file or drag & drop it here</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">JPEG, PNG, upto 10MB</span>

          <button
            type="button"
            className="mt-4 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 font-bold text-[11px] text-slate-600 px-6 py-2 transition-all shadow-sm"
          >
            Browse Files
          </button>
        </div>

        {/* Selected file preview */}
        {file && (
          <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs">
            <span className="text-emerald-700 font-semibold truncate">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <p className="text-[10px] text-slate-400 font-medium text-center">
          Upload images of your preferred document/image
        </p>
      </div>

      {/* Question Paper Name Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600">Question Paper Name</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. CBSE Grade 8 Science Term Exam"
          className="w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-4 py-3 outline-none focus:border-[#6C5CE7] transition-all shadow-sm placeholder:text-slate-300"
          required
        />
      </div>

      {/* Due Date & Student Class Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Due Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">Due Date</label>
          <div className="relative flex items-center">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-4 py-3 outline-none focus:border-[#6C5CE7] transition-all pr-10 appearance-none"
              style={{ colorScheme: 'light' }}
            />
            <Calendar className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Student Class */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">Class / Grade</label>
          <div className="relative flex items-center">
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-4 py-3 outline-none focus:border-[#6C5CE7] transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a0aec0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_16px_center] bg-no-repeat pr-10"
            >
              {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((cls) => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Question Config Table */}
      <div className="space-y-3">
        {/* Row Labels Header (Desktop Only) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-7">Question Type</div>
          <div className="col-span-2.5 text-center">No. of Questions</div>
          <div className="col-span-2.5 text-center">Marks</div>
        </div>

        {/* Dynamic rows list */}
        <div className="space-y-2.5">
          {rows.map((row, idx) => (
            <div key={idx} className="space-y-2.5">
              {/* 1. Desktop Row Layout (Grid-based) */}
              <div className="hidden md:grid grid-cols-12 items-center gap-3">
                {/* Question Type dropdown selector */}
                <div className="col-span-7 flex items-center gap-2">
                  <select
                    value={row.type}
                    onChange={(e) => handleTypeChange(idx, e.target.value as QuestionType)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#6C5CE7] shadow-sm appearance-none cursor-pointer"
                  >
                    {FRIENDLY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  {/* Remove Row Cross */}
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* No of Questions counter pill */}
                <div className="col-span-2.5 flex items-center justify-between bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleDecrementCount(idx)}
                    className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 active:scale-95 font-bold text-sm transition-all"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-slate-700">{row.count}</span>
                  <button
                    type="button"
                    onClick={() => handleIncrementCount(idx)}
                    className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 active:scale-95 font-bold text-sm transition-all"
                  >
                    +
                  </button>
                </div>

                {/* Marks counter pill */}
                <div className="col-span-2.5 flex items-center justify-between bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleDecrementMarks(idx)}
                    className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 active:scale-95 font-bold text-sm transition-all"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-slate-700">{row.marks}</span>
                  <button
                    type="button"
                    onClick={() => handleIncrementMarks(idx)}
                    className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 active:scale-95 font-bold text-sm transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 2. Mobile Row Layout (Custom dual-counter stacked cards, Figma matching) */}
              <div className="md:hidden flex flex-col bg-white border border-slate-200/60 rounded-2xl p-4 gap-3 relative shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <select
                      value={row.type}
                      onChange={(e) => handleTypeChange(idx, e.target.value as QuestionType)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#6C5CE7] shadow-sm appearance-none cursor-pointer"
                    >
                      {FRIENDLY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-3 shadow-inner">
                  <div className="space-y-1 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">No. of Questions</span>
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-full p-1 max-w-[110px] mx-auto w-full shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleDecrementCount(idx)}
                        className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold text-sm transition-all"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-700">{row.count}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrementCount(idx)}
                        className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold text-sm transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Marks</span>
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-full p-1 max-w-[110px] mx-auto w-full shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleDecrementMarks(idx)}
                        className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold text-sm transition-all"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-700">{row.marks}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrementMarks(idx)}
                        className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold text-sm transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 font-bold text-xs shadow-sm transition-all mt-3"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2D3748] text-white">
            <Plus className="h-3 w-3" />
          </div>
          Add Question Type
        </button>

        {/* Calculated Totals right side */}
        <div className="pt-2 text-right space-y-0.5 pr-2">
          <p className="text-xs font-bold text-slate-600">Total Questions : {totalQuestions}</p>
          <p className="text-xs font-bold text-slate-600">Total Marks : {totalMarks}</p>
        </div>
      </div>

      {/* Additional Instructions / Input Area */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600">Additional Information (For better output)</label>
        <div className="relative">
          <textarea
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="e.g Generate a question paper for 3 hour exam duration.."
            rows={3}
            className="w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl p-4 pr-10 outline-none focus:border-[#6C5CE7] transition-all resize-none shadow-sm placeholder:text-slate-300"
          />
          <button
            type="button"
            onClick={startListening}
            className={`absolute bottom-4 right-4 h-6 w-6 flex items-center justify-center rounded-lg border transition-all shadow-sm ${
              isListening
                ? 'bg-rose-50 border-rose-200 text-rose-500 animate-pulse scale-110 shadow-rose-100'
                : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
            title="Dictate instructions"
          >
            <Mic className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {/* Previous Pill */}
        <button
          type="button"
          className="rounded-full border border-slate-200 hover:bg-slate-50 px-6 py-2.5 font-bold text-xs text-slate-600 transition-all shadow-sm"
        >
          ← Previous
        </button>

        {/* Next/Submit Pill */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#2D3748] hover:bg-[#1A202C] px-8 py-2.5 font-bold text-xs text-white transition-all shadow-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating...
            </>
          ) : (
            'Next →'
          )}
        </button>
      </div>
    </form>
  );
}
