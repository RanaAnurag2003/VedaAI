'use client';

import { AssignmentForm } from '@/components/forms/AssignmentForm';
import { Header } from '@/components/layout/Header';
import { Sparkles } from 'lucide-react';

export default function CreatePage() {
  return (
    <div
      className="min-h-screen bg-[#080E1A]"
      style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(108,92,231,0.1) 0%, transparent 60%)' }}
    >
      <Header />

      <div className="mx-auto max-w-screen-2xl px-4 py-8 md:px-8">
        {/* Page title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Assessment Creator
          </div>
          <h1 className="text-3xl font-bold text-slate-100 md:text-4xl">
            Create <span className="gradient-text">Assessment</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm max-w-lg">
            Configure your exam below. Our AI will generate a structured question paper in seconds.
          </p>
        </div>

        {/* Single centered form panel */}
        <div className="max-w-2xl">
          <div className="glass-card p-6 md:p-8">
            <AssignmentForm />
          </div>
        </div>
      </div>
    </div>
  );
}
