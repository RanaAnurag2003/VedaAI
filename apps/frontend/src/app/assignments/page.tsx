'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home as HomeIcon,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  ArrowLeft,
  Bell,
  ChevronDown,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Plus,
  FileText,
  Menu,
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
    <div className="min-h-screen bg-[#F4F5F7] text-slate-800 font-sans flex flex-col md:flex-row antialiased">
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="hidden md:flex flex-col w-[280px] bg-white border-r border-[#E5E7EB] px-5 py-6 h-screen sticky top-0 justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <div className="h-9 w-9 bg-[#FA5A15] rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              V
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#1E293B]">
              Veda<span className="text-[#FA5A15]">AI</span>
            </span>
          </div>

          {/* Primary CTA button */}
          <button
            onClick={() => router.push('/create')}
            className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white py-3.5 px-4 rounded-full font-semibold transition-all duration-300 shadow-md border border-[#FA5A15] relative group"
            style={{
              boxShadow: '0 0 14px rgba(250, 90, 21, 0.25)',
            }}
          >
            <span className="text-base">✨ Create Assignment</span>
          </button>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 pt-2">
            {[
              { label: 'Home', icon: HomeIcon, href: '#', active: false },
              { label: 'My Groups', icon: Users, href: '#', active: false },
              { label: 'Assignments', icon: BookOpen, href: '/assignments', active: true, badge: assignments.length },
              { label: 'AI Teacher’s Toolkit', icon: GraduationCap, href: '#', active: false },
              { label: 'My Library', icon: FileText, href: '#', active: false },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  item.active
                    ? 'bg-[#F3F4F6] text-[#1E293B] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1E293B] hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.active ? 'text-[#1E293B]' : 'text-[#9CA3AF]'}`} />
                  <span className="text-[15px]">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#FA5A15] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom items */}
        <div className="space-y-4 pt-4">
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#6B7280] hover:text-[#1E293B] hover:bg-[#F9FAFB] transition-all duration-200 font-medium"
          >
            <Settings className="h-5 w-5 text-[#9CA3AF]" />
            <span className="text-[15px]">Settings</span>
          </Link>

          {/* School Profile Card */}
          <div className="flex items-center gap-3 bg-[#F3F4F6] p-3 rounded-2xl border border-[#E5E7EB]">
            <div className="h-10 w-10 rounded-full bg-[#FA5A15]/10 border border-[#FA5A15]/20 flex items-center justify-center font-extrabold text-sm text-[#FA5A15]">
              DP
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-[#1E293B] leading-snug truncate">Delhi Public School</h4>
              <p className="text-xs text-[#6B7280] font-medium truncate">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* ==================== DESKTOP TOP HEADER ==================== */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-[#E5E7EB] px-8 py-4 h-[72px] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-[#6B7280] hover:text-[#1E293B] transition-colors p-1.5 hover:bg-[#F3F4F6] rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#9CA3AF]" />
              <span className="text-sm font-semibold text-[#6B7280] tracking-wide uppercase">Assignment</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification bell */}
            <button className="relative p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors">
              <Bell className="h-[22px] w-[22px] text-[#6B7280]" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-[#FA5A15] rounded-full border border-white" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2.5 border-l border-[#E5E7EB] pl-5 cursor-pointer group">
              <div className="h-9 w-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-sm">
                JD
              </div>
              <span className="font-semibold text-sm text-[#1E293B] group-hover:text-[#FA5A15] transition-colors">
                John Doe
              </span>
              <ChevronDown className="h-4 w-4 text-[#6B7280]" />
            </div>
          </div>
        </header>

        {/* ==================== MOBILE HEADER ==================== */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-[#E5E7EB] px-4 py-3.5 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#FA5A15] rounded-lg flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              V
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#1E293B]">
              Veda<span className="text-[#FA5A15]">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg">
              <Bell className="h-5 w-5 text-[#6B7280]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#FA5A15] rounded-full" />
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
              JD
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <Menu className="h-5 w-5 text-[#6B7280]" />
            </button>
          </div>
        </header>

        {/* ==================== DASHBOARD PANEL CONTENT ==================== */}
        <div className="flex-1 p-4 md:p-8 max-w-screen-xl w-full mx-auto pb-24 md:pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
              <div className="h-10 w-10 border-4 border-[#FA5A15] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-semibold">Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            /* ==================== EMPTY STATE ==================== */
            <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto text-center px-4">
              {/* SVG Empty State Illustration */}
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

              <h2 className="text-2xl font-extrabold text-[#1E293B] mb-2">No assignments yet</h2>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-8">
                Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>

              <button
                onClick={() => router.push('/create')}
                className="bg-[#1A1A1A] hover:bg-[#333] text-white font-bold py-3.5 px-8 rounded-full shadow-md transition-all duration-300"
              >
                + Create Your First Assignment
              </button>
            </div>
          ) : (
            /* ==================== FILLED STATE ==================== */
            <div className="space-y-6">
              {/* Heading */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#10B981] rounded-full animate-pulse" />
                  <h1 className="text-2xl font-extrabold text-[#1E293B]">Assignments</h1>
                </div>
                <p className="text-[#6B7280] text-sm">
                  Manage and create assignments for your classes.
                </p>
              </div>

              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] px-4 py-2.5 rounded-xl font-semibold text-sm text-[#4B5563] shadow-sm transition-colors">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter By
                </button>

                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search Assignment"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FA5A15]/40 focus:border-[#FA5A15] shadow-sm transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Grid of Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between h-[150px]"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-[#1E293B] max-w-[85%] leading-tight">
                        {assignment.title}
                      </h3>

                      {/* Dropdown Menu Container */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === assignment.id ? null : assignment.id)
                          }
                          className="text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {activeMenuId === assignment.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-1 w-[160px] bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1.5 z-30 animate-fade-in-up"
                          >
                            <button
                              onClick={() => router.push(`/assignments/${assignment.id}`)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-slate-50 transition-colors"
                            >
                              View Assignment
                            </button>
                            <button
                              onClick={() => handleDelete(assignment.id)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#9CA3AF] border-t border-[#F3F4F6] pt-3.5">
                      <span>
                        Assigned on :{' '}
                        <span className="text-[#6B7280]">
                          {new Date(assignment.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                      <span>
                        Due :{' '}
                        <span className="text-[#6B7280]">
                          {new Date(assignment.dueDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==================== DESKTOP FLOATING BOTTOM CTA ==================== */}
        {assignments.length > 0 && (
          <div className="hidden md:flex fixed bottom-6 left-[calc(50%+140px)] transform -translate-x-1/2 z-20">
            <button
              onClick={() => router.push('/create')}
              className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white py-3.5 px-7 rounded-full font-bold shadow-lg transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              Create Assignment
            </button>
          </div>
        )}

        {/* ==================== MOBILE FLOATING PLUS BUTTON ==================== */}
        {assignments.length > 0 && (
          <div className="md:hidden fixed bottom-20 right-4 z-20">
            <button
              onClick={() => router.push('/create')}
              className="h-12 w-12 rounded-full bg-[#FA5A15] hover:bg-[#E04F10] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* ==================== MOBILE BOTTOM NAV BAR ==================== */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] text-white border-t border-white/5 py-2.5 px-6 flex items-center justify-between z-20 rounded-t-3xl">
          {[
            { label: 'Home', icon: HomeIcon, active: false },
            { label: 'Assignments', icon: BookOpen, active: true },
            { label: 'Library', icon: FileText, active: false },
            { label: 'AI Toolkit', icon: GraduationCap, active: false },
          ].map((item, idx) => (
            <button
              key={idx}
              className="flex flex-col items-center gap-1 focus:outline-none transition-opacity active:opacity-75"
            >
              <item.icon className={`h-5 w-5 ${item.active ? 'text-white' : 'text-slate-500'}`} />
              <span className={`text-[10px] font-bold ${item.active ? 'text-white' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
