'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  MoreVertical,
  Search,
  SlidersHorizontal,
  Plus,
  Menu,
  LayoutGrid
} from 'lucide-react';
import { listAssignments, deleteAssignment } from '@/services/assignmentService';
import type { AssignmentResponse } from '@vedaai/shared-types';
import { useToast } from '@/hooks/use-toast';

export default function AssignmentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch assignments on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await listAssignments();
        setAssignments(data);
      } catch (err) {
        console.error('Failed to load assignments', err);
        toast({
          title: 'Error loading assignments',
          description: 'Please check your connection.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // Handle Delete Assignment
  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      setActiveMenuId(null);
      toast({
        title: 'Success',
        description: 'Assignment deleted successfully.',
      });
    } catch (err) {
      console.error('Failed to delete assignment', err);
      toast({
        title: 'Error deleting assignment',
        description: 'Could not complete deletion.',
        variant: 'destructive',
      });
    }
  };

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#DFE3E8] font-sans antialiased text-[#1F2937] p-2 md:p-4 gap-4 relative">
      {/* ==================== 1. LEFT SIDEBAR NAVIGATION ==================== */}
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
          <button
            onClick={() => router.push('/create')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2D3748] text-white py-3.5 px-4 font-semibold text-sm shadow-md hover:bg-[#1A202C] transition-all duration-200"
          >
            <span className="text-base font-bold">+</span>
            Create Assignment
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { label: 'Home', icon: HomeIcon, active: false },
              { label: 'My Groups', icon: Users, active: false },
              { label: 'Assignments', icon: FileText, active: true, badge: assignments.length },
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

      {/* ==================== 2. MAIN WORKSPACE ==================== */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col gap-6 pr-2 pb-24 lg:pb-20">
        {/* Workspace Top Header (Responsive: Transparent on Desktop, White on Mobile) */}
        <header className="flex items-center justify-between py-3 px-4 lg:py-2 lg:px-0 bg-white lg:bg-transparent rounded-[20px] lg:rounded-none shadow-sm lg:shadow-none border border-[#E5E7EB]/50 lg:border-none flex-shrink-0">
          {/* Left Side: Back Assignment (Desktop) OR Logo (Mobile) */}
          <div className="flex items-center gap-4">
            <Link
              href="/assignments"
              className="hidden lg:flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <div className="hidden lg:flex items-center gap-2 text-slate-500 font-semibold">
              <LayoutGrid className="h-4.5 w-4.5 text-slate-400" />
              <span className="text-sm font-semibold">Assignment</span>
            </div>
          </div>

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
              <span className="hidden sm:inline text-xs font-bold text-slate-700">Anurag Rana</span>
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
                <h1 className="text-lg lg:text-xl font-bold text-slate-800 leading-tight">Assignments</h1>
                <p className="text-[10px] lg:text-xs text-slate-400 font-medium">Manage and create assignments for your classes.</p>
              </div>
            </div>
          </div>

          {/* Horizontal progress bar */}
          <div className="w-full relative h-[3px] bg-slate-300/40 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="space-y-6">
          {/* Controls Row: Filter By and Search */}
          <div className="flex flex-row items-center justify-between gap-4 px-2">
            {/* Filter button */}
            <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 shadow-sm transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              Filter By
            </button>

            {/* Search Input Box */}
            <div className="relative max-w-xs md:max-w-md w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              {/* Desktop Placeholder */}
              <input
                type="text"
                placeholder="Search Assignment"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hidden md:block w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#6C5CE7] shadow-sm transition-all placeholder:text-slate-300"
              />
              {/* Mobile Placeholder */}
              <input
                type="text"
                placeholder="Search Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:hidden w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#6C5CE7] shadow-sm transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Grid of Cards / Loading / Empty */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
              <div className="h-10 w-10 border-4 border-slate-300 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-bold">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            /* ==================== EMPTY STATE ==================== */
            <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-lg mx-auto text-center px-4">
              <div className="relative mb-6 flex items-center justify-center">
                <div className="w-48 h-48 bg-[#E5E7EB]/50 rounded-full absolute -z-10" />
                <svg
                  className="w-40 h-40"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="55" y="40" width="90" height="120" rx="16" fill="white" stroke="#D1D5DB" strokeWidth="3" />
                  <line x1="75" y1="70" x2="125" y2="70" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />
                  <line x1="75" y1="90" x2="125" y2="90" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />
                  <line x1="75" y1="110" x2="110" y2="110" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="120" cy="120" r="30" fill="white" stroke="#9CA3AF" strokeWidth="3" />
                  <line x1="138" y1="138" x2="155" y2="155" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="120" cy="120" r="14" fill="#FEE2E2" />
                  <path d="M113 113L127 127M127 113L113 127" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">No assignments yet</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Create your first assignment to start collecting and grading student submissions. Let AI assist with grading.
              </p>

              <button
                onClick={() => router.push('/create')}
                className="bg-[#2D3748] hover:bg-[#1A202C] text-white font-bold py-3.5 px-8 rounded-full shadow-md transition-all duration-300"
              >
                + Create Your First Assignment
              </button>
            </div>
          ) : (
            /* ==================== CARDS GRID LIST ==================== */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-1 pb-16">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white border border-slate-100/80 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between h-[155px]"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-base lg:text-lg font-bold text-slate-800 max-w-[85%] leading-snug">
                      {assignment.title}
                    </h3>

                    {/* Dropdown Menu Container */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === assignment.id ? null : assignment.id)
                        }
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <MoreVertical className="h-4.5 w-4.5" />
                      </button>

                      {activeMenuId === assignment.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 mt-1 w-[160px] bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in-up"
                        >
                          <button
                            onClick={() => router.push(`/assignments/${assignment.id}`)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            View Assignment
                          </button>
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card footer date indicators */}
                  <div className="flex items-center justify-between text-[10px] lg:text-[12px] font-bold text-slate-700">
                    <span>
                      Assigned on :{' '}
                      <span className="text-slate-400 font-semibold ml-0.5">
                        {new Date(assignment.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }).replace(/\//g, '-')}
                      </span>
                    </span>
                    <span>
                      Due :{' '}
                      <span className="text-slate-400 font-semibold ml-0.5">
                        {new Date(assignment.dueDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }).replace(/\//g, '-')}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ==================== 3. DESKTOP FLOATING BOTTOM CTA ==================== */}
      {assignments.length > 0 && (
        <div className="hidden md:flex fixed bottom-6 left-[calc(50%+140px)] transform -translate-x-1/2 z-20">
          <button
            onClick={() => router.push('/create')}
            className="flex items-center gap-2 bg-[#1A202C] hover:bg-[#0F172A] text-white py-3.5 px-8 rounded-full font-bold shadow-lg transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            Create Assignment
          </button>
        </div>
      )}

      {/* ==================== 4. MOBILE FLOATING ACTION ACTION BUTTON (FAB) ==================== */}
      {assignments.length > 0 && (
        <div className="lg:hidden fixed bottom-20 right-4 z-40">
          <button
            onClick={() => router.push('/create')}
            className="h-12 w-12 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-[#E28743] flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
          >
            <Plus className="h-6 w-6 text-[#E28743]" />
          </button>
        </div>
      )}

      {/* ==================== 5. MOBILE BOTTOM STICKY NAVIGATION BAR ==================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A] text-white py-3 px-8 rounded-t-3xl border-t border-slate-800 shadow-xl flex items-center justify-between z-50">
        {[
          { label: 'Home', icon: HomeIcon, active: false },
          { label: 'Assignments', icon: FileText, active: true },
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
