import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-white/[0.06] bg-[#080E1A]/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/create" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">Veda</span>
            <span className="text-slate-100">AI</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <Link
            href="/create"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] transition-all duration-200"
          >
            Create Assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}
