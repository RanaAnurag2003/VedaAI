import { Header } from './Header';

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function PageShell({ children, title, subtitle }: PageShellProps) {
  return (
    <div className="min-h-screen bg-[#080E1A]" style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(108,92,231,0.08) 0%, transparent 55%)' }}>
      <Header />
      <main className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6 md:py-10">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h1 className="text-2xl font-bold text-slate-100 md:text-3xl">{title}</h1>}
            {subtitle && <p className="mt-2 text-slate-400">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
