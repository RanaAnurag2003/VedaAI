'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AssessmentPaper } from '@vedaai/shared-types';
import { ExamPaperPdf } from './ExamPaperPdf';

interface DownloadPdfButtonProps {
  paper: AssessmentPaper;
  variant?: 'default' | 'white';
}

export function DownloadPdfButton({ paper, variant = 'default' }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(<ExamPaperPdf paper={paper} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${paper.title.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'white') {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className="bg-white hover:bg-slate-100 text-[#1E1F21] font-extrabold px-6 py-3 rounded-full shadow transition-all duration-150 flex items-center gap-2 border-none h-auto text-xs uppercase tracking-wider disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4 stroke-[3]" />
        )}
        Download as PDF
      </button>
    );
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Download PDF
    </Button>
  );
}

