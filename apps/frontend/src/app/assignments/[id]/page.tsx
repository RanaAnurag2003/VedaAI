'use client';

// Force recompile
import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GenerationProgressTracker } from '@/components/assessment/GenerationProgress';
import { ExamPaper } from '@/components/assessment/ExamPaper';
import { ExamPaperSkeleton } from '@/components/assessment/ExamPaperSkeleton';
import { EmptyState } from '@/components/assessment/EmptyState';
import { DownloadPdfButton } from '@/components/assessment/DownloadPdfButton';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useSocket } from '@/hooks/useSocket';
import { useAssignmentDetail, useRegenerate } from '@/hooks/useAssignment';
import { listAssignments } from '@/services/assignmentService';
import {
  Home as HomeIcon,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
  ArrowLeft,
  Bell,
  ChevronDown,
  Menu,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { loading } = useAssignmentDetail(id);
  useSocket(id);

  const paper = useAssignmentStore((s) => s.paper);
  const status = useAssignmentStore((s) => s.status);
  const assignment = useAssignmentStore((s) => s.assignment);
  const error = useAssignmentStore((s) => s.error);
  const isStreaming = useAssignmentStore((s) => s.isStreaming);
  const { regenerate, regenerating } = useRegenerate(id);

  const [assignmentsCount, setAssignmentsCount] = useState<number>(2);
  const toastedRef = useRef<string | null>(null);

  useEffect(() => {
    async function loadCount() {
      try {
        const list = await listAssignments();
        if (list && Array.isArray(list)) {
          setAssignmentsCount(list.length);
        }
      } catch (err) {
        console.error('Failed to load assignments list in detail page', err);
      }
    }
    loadCount();
  }, []);

  useEffect(() => {
    const key = `${status}-${error ?? ''}-${paper?.title ?? ''}`;
    if (toastedRef.current === key) return;

    if (status === 'failed' && error) {
      toast({ title: 'Generation failed', description: error, variant: 'destructive' });
      toastedRef.current = key;
    } else if (status === 'completed' && paper) {
      toast({ title: '✨ Success', description: 'Your question paper is ready!' });
      toastedRef.current = key;
    }
  }, [status, error, paper]);

  const isGenerating =
    (status === 'queued' || status === 'processing' || status === 'generating' || regenerating) && !isStreaming;
  const showPaper = (status === 'completed' || isStreaming) && !!paper;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#DFE3E8] font-sans antialiased text-[#1F2937] p-2 md:p-4 gap-4 relative">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex w-[280px] flex-shrink-0 bg-white rounded-[24px] shadow-sm border border-[#E5E7EB]/50 flex-col justify-between p-6 h-full">
        <div className="space-y-8">
          {/* VedaAI Logo Header */}
          <div className="flex items-center gap-3 pl-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 shadow-md">
              <span className="text-white font-extrabold text-xl tracking-tight">V</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-800">Veda</span>
              <span className="text-xl font-bold tracking-tight text-[#E28743]">AI</span>
            </div>
          </div>

          {/* AI Teacher's Toolkit Button */}
          <button
            onClick={() => router.push('/create')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E1F21] border border-orange-500/30 text-white py-3.5 px-4 font-semibold text-sm shadow-md hover:bg-[#2D3748] transition-all duration-200"
          >
            <Sparkles className="h-4 w-4 text-orange-400" />
            AI Teacher's Toolkit
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { label: 'Home', icon: HomeIcon, active: false },
              { label: 'My Groups', icon: Users, active: false },
              { label: 'Assignments', icon: FileText, active: true, badge: assignmentsCount },
              { label: 'AI Teacher\'s Toolkit', icon: Sparkles, active: false },
              { label: 'My Library', icon: BookOpen, active: false },
            ].map((item) => (
              <Link
                key={item.label}
                href="/assignments"
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 ${
                  item.active
                    ? 'bg-slate-100 text-[#1F2937] font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4.5 w-4.5 ${item.active ? 'text-[#E28743]' : 'text-slate-400'}`} />
                  {item.label}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-[#E28743] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Settings */}
          <Link
            href="#"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
          >
            <Settings className="h-4.5 w-4.5 text-slate-400" />
            Settings
          </Link>

          {/* Institution Card */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-sm">
            <div className="h-10 w-10 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="h-10 w-10 rounded-full bg-amber-100 border border-amber-200">
                <circle cx="50" cy="50" r="50" fill="#FFE5D9" />
                <circle cx="50" cy="40" r="20" fill="#F8B195" />
                <path d="M20,80 C20,60 80,60 80,80 Z" fill="#6C5CE7" />
                <circle cx="45" cy="38" r="2.5" fill="#2D3748" />
                <circle cx="55" cy="38" r="2.5" fill="#2D3748" />
                <path d="M45,45 Q50,50 55,45" fill="none" stroke="#2D3748" strokeWidth={3} strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">ABESIT</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">Ghaziabad</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 h-full overflow-y-auto bg-[#2B2C2E] rounded-[24px] p-6 flex flex-col gap-6 relative">
        {/* Workspace Top Header */}
        <header className="flex items-center justify-between bg-white rounded-[20px] px-6 py-3.5 shadow-sm border border-[#E5E7EB]/50 flex-shrink-0">
          {/* Left Side: Back Arrow and Create New */}
          <div className="flex items-center gap-4">
            <Link
              href="/assignments"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/create"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="text-sm font-bold">+</span>
              Create New
            </Link>
          </div>

          {/* Right Side: Notification Bell & Profile Dropdown */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Bell Icon with red badge */}
            <button className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 shadow-sm transition-colors">
              <Bell className="h-4.5 w-4.5 text-slate-500" />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>

            {/* Profile Card */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer shadow-sm transition-colors">
              <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border border-purple-200 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle cx="50" cy="50" r="50" fill="#E0D7FF" />
                  <circle cx="50" cy="38" r="18" fill="#5A4BD4" />
                  <path d="M25,82 C25,65 75,65 75,82 Z" fill="#5A4BD4" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-700">Anurag Rana</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Dynamic Alert Success Banner */}
        <div className="bg-[#1E1F21] text-white rounded-[20px] p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/[0.04] flex-shrink-0">
          <div className="space-y-1 max-w-2xl">
            <p className="text-sm font-semibold leading-relaxed text-slate-200">
              Certainly, Anurag Rana! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
            </p>
          </div>
          <div className="flex-shrink-0">
            {showPaper && (
              <DownloadPdfButton paper={paper} variant="white" />
            )}
          </div>
        </div>

        {/* Output Canvas Area */}
        <div className="flex-1 w-full min-h-0">
          {/* Two-panel layout or full-width paper based on status */}
          {!showPaper && (status === 'queued' || status === 'processing' || status === 'generating' || regenerating) ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full items-start">
              {/* Left progress panel */}
              <div className="lg:col-span-2 space-y-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-200">
                      {assignment?.title ?? 'Assessment'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {assignment?.questionCount ?? '—'} questions · {assignment?.totalMarks ?? '—'} marks
                    </p>
                  </div>
                </div>

                <GenerationProgressTracker />
              </div>

              {/* Right panel skeleton */}
              <div className="lg:col-span-3">
                <ExamPaperSkeleton />
              </div>
            </div>
          ) : showPaper ? (
            <div className="max-w-4xl mx-auto w-full">
              <ExamPaper
                paper={paper}
                totalMarks={assignment?.totalMarks}
                dueDate={assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : undefined}
                isStreaming={isStreaming}
              />
            </div>
          ) : (
            <div className="bg-[#1E1F21] border border-white/[0.04] rounded-3xl p-8 text-center text-slate-400">
              <EmptyState />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
