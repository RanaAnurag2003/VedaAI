'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function FileDropzone({ value, onChange, error }: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) onChange(file);
    },
    [onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) onChange(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-purple-400">
        Reference Material <span className="normal-case text-slate-500 font-normal">(optional)</span>
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-all duration-200',
          dragActive
            ? 'border-purple-500/70 bg-purple-500/10'
            : 'border-white/10 bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/5',
          error && 'border-rose-500/50',
        )}
      >
        <input
          type="file"
          accept=".pdf,.txt"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleChange}
        />
        {value ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-200">{value.name}</p>
              <p className="text-xs text-slate-500">{(value.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="ml-4 rounded-lg p-1.5 hover:bg-white/10 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 mb-3">
              <Upload className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">Drop your file here or click to browse</p>
            <p className="mt-1 text-xs text-slate-500">PDF or TXT up to 10MB</p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function isValidFile(file: File): boolean {
  return Object.keys({ 'application/pdf': [], 'text/plain': [] }).includes(file.type) || /\.(pdf|txt)$/i.test(file.name);
}
