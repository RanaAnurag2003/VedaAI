'use client';

import { AssignmentForm } from '@/components/forms/AssignmentForm';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { listAssignments } from '@/services/assignmentService';
import {
  Home,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
  ArrowLeft,
  Bell,
  ChevronDown,
  Menu
} from 'lucide-react';

export default function CreatePage() {
  const [assignmentsCount, setAssignmentsCount] = useState<number>(2);

  useEffect(() => {
    async function loadCount() {
      try {
        const list = await listAssignments();
        if (list && Array.isArray(list)) {
          setAssignmentsCount(list.length);
        }
      } catch (err) {
        console.error('Failed to load count in create page', err);
      }
    }
    loadCount();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#DFE3E8] font-sans antialiased text-[#1F2937] p-2 md:p-4 gap-4 relative">
      {/* 1. Left Sidebar Navigation (Desktop only, hidden on mobile) */}
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

          {/* Create Assignment Button */}
          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2D3748] text-white py-3.5 px-4 font-semibold text-sm shadow-md hover:bg-[#1A202C] transition-all duration-200">
            <span className="text-base font-bold">+</span>
            Create Assignment
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { label: 'Home', icon: Home, active: false },
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
                {item.badge && (
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

      {/* 2. Main Workspace (Independently Scrollable on Right) */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col gap-6 pr-2 pb-24 lg:pb-6">
        {/* Workspace Top Header (Responsive: Transparent on Desktop, White on Mobile) */}
        <header className="flex items-center justify-between py-3 px-4 lg:py-2 lg:px-0 bg-white lg:bg-transparent rounded-[20px] lg:rounded-none shadow-sm lg:shadow-none border border-[#E5E7EB]/50 lg:border-none flex-shrink-0">
          {/* Left Side: Back Assignment (Desktop) OR Logo (Mobile) */}
          <Link
            href="/assignments"
            className="hidden lg:flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span className="text-sm font-semibold">Assignment</span>
          </Link>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm">
              <span className="text-white font-extrabold text-sm">V</span>
            </div>
            <span className="text-sm font-bold text-slate-800">Veda<span className="text-[#E28743]">AI</span></span>
          </div>

          {/* Right Side: Icons & Profile & Hamburger */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Bell Icon with badge */}
            <button className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 lg:bg-white border border-slate-100 lg:border-slate-100 hover:bg-slate-100 shadow-sm transition-colors">
              <Bell className="h-4.5 w-4.5 text-slate-500" />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>

            {/* John Doe Profile */}
            <div className="flex items-center gap-2 bg-slate-50 lg:bg-white border border-slate-100 px-2 py-1.5 lg:px-3 lg:py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer shadow-sm transition-colors">
              <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border border-purple-200 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle cx="50" cy="50" r="50" fill="#E0D7FF" />
                  <circle cx="50" cy="38" r="18" fill="#5A4BD4" />
                  <path d="M25,82 C25,65 75,65 75,82 Z" fill="#5A4BD4" />
                </svg>
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-700 font-sans">Anurag Rana</span>
              <ChevronDown className="hidden sm:inline h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Hamburger Menu Icon (Mobile Only) */}
            <button className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 shadow-sm transition-colors text-slate-500">
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Header Title with green dot & step progress bar */}
        <div className="space-y-4 px-2">
          <div className="flex items-center gap-3">
            {/* Back Button circle in Mobile Mode */}
            <Link
              href="/assignments"
              className="lg:hidden h-8 w-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-start gap-2.5 lg:gap-3">
              <span className="hidden lg:inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 mt-2 shadow-sm animate-pulse" />
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-slate-800 leading-tight">Create Assignment</h1>
                <p className="text-[10px] lg:text-xs text-slate-400 font-medium">Set up a new assignment for your students</p>
              </div>
            </div>
          </div>

          {/* Horizontal progress bar */}
          <div className="w-full relative h-[3px] bg-slate-300/40 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-[#2D3748] rounded-full" />
          </div>
        </div>

        {/* Centered Assignment Details Form Card */}
        <div className="w-full py-2">
          <AssignmentForm />
        </div>
      </main>

      {/* 3. Mobile Sticky Bottom Navigation Bar (Figma Clone) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A] text-white py-3 px-8 rounded-t-3xl border-t border-slate-800 shadow-xl flex items-center justify-between z-50">
        {[
          { label: 'Home', icon: Home, active: false },
          { label: 'My Groups', icon: Users, active: true },
          { label: 'Library', icon: BookOpen, active: false },
          { label: 'AI Toolkit', icon: Sparkles, active: false },
        ].map((item) => (
          <button key={item.label} className="flex flex-col items-center gap-1.5 focus:outline-none">
            <item.icon className={`h-5 w-5 ${item.active ? 'text-[#E28743]' : 'text-slate-500 hover:text-slate-400'}`} />
            <span className={`text-[9px] font-bold tracking-wide uppercase ${item.active ? 'text-white' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
