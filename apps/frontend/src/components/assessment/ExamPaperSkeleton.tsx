export function ExamPaperSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="exam-paper">
        <div className="border-b border-slate-200 pb-8 mb-8 text-center space-y-4">
          <div className="mx-auto h-6 w-32 rounded-full shimmer-light" />
          <div className="mx-auto h-8 w-64 rounded-xl shimmer-light" />
          <div className="flex justify-center gap-4 mt-4">
            {[120, 80, 100].map((w) => (
              <div key={w} className={`h-4 w-${w} rounded shimmer-light`} />
            ))}
          </div>
        </div>

        {/* Question skeletons */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mb-6">
            <div className="flex gap-3 items-start">
              <div className="h-7 w-7 rounded-full shimmer-light flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full rounded shimmer-light" />
                <div className="h-4 w-3/4 rounded shimmer-light" />
              </div>
              <div className="h-6 w-16 rounded-full shimmer-light flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
