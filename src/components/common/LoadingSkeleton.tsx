import React from 'react';

interface LoadingSkeletonProps {
  type?: 'table' | 'cards' | 'kpis' | 'chart';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'table',
  count = 5,
  className = ''
}) => {
  if (type === 'kpis') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`} aria-busy="true" aria-label="Loading metric cards">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#0D1424] border border-[#18243A] animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-24 bg-[#18243A] rounded" />
              <div className="w-10 h-10 rounded-xl bg-[#18243A]" />
            </div>
            <div className="h-8 w-28 bg-[#18243A] rounded mb-3" />
            <div className="h-3 w-36 bg-[#18243A] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} aria-busy="true" aria-label="Loading cards">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#0D1424] border border-[#18243A] animate-pulse space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-[#18243A] rounded" />
              <div className="h-5 w-16 bg-[#18243A] rounded-full" />
            </div>
            <div className="h-5 w-40 bg-[#18243A] rounded" />
            <div className="h-3 w-32 bg-[#18243A] rounded" />
            <div className="pt-2 border-t border-[#18243A] flex justify-between">
              <div className="h-3 w-20 bg-[#18243A] rounded" />
              <div className="h-4 w-16 bg-[#18243A] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`p-6 rounded-2xl bg-[#0D1424] border border-[#18243A] animate-pulse ${className}`} aria-busy="true" aria-label="Loading chart data">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <div className="h-4 w-36 bg-[#18243A] rounded" />
            <div className="h-3 w-56 bg-[#18243A] rounded" />
          </div>
          <div className="h-6 w-24 bg-[#18243A] rounded" />
        </div>
        <div className="h-56 flex items-end justify-between gap-4 pt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-[#18243A] rounded-t-lg"
              style={{ height: `${25 + (i * 15) % 70}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div className={`rounded-2xl bg-[#0D1424] border border-[#18243A] overflow-hidden ${className}`} aria-busy="true" aria-label="Loading tabular data">
      <div className="h-12 bg-[#080D18] border-b border-[#18243A] flex items-center px-4 gap-4">
        <div className="h-3 w-16 bg-[#18243A] rounded" />
        <div className="h-3 w-28 bg-[#18243A] rounded" />
        <div className="h-3 w-20 bg-[#18243A] rounded" />
        <div className="h-3 w-20 bg-[#18243A] rounded" />
        <div className="h-3 w-16 bg-[#18243A] rounded ml-auto" />
      </div>
      <div className="divide-y divide-[#18243A]">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
            <div className="h-4 w-16 bg-[#18243A] rounded font-mono" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-36 bg-[#18243A] rounded" />
              <div className="h-2.5 w-24 bg-[#18243A]/70 rounded" />
            </div>
            <div className="h-3.5 w-24 bg-[#18243A] rounded hidden sm:block" />
            <div className="h-5 w-20 bg-[#18243A] rounded-full" />
            <div className="h-4 w-16 bg-[#18243A] rounded text-right ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};
