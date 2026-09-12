import React from 'react';

export const LoadingSkeleton = ({ type = 'cards', count = 4 }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-slate-200 h-28 rounded-xl border border-slate-300"></div>
        ))}
      </div>
    );
  }

  if (type === 'map') {
    return (
      <div className="bg-slate-200 h-[420px] rounded-xl border border-slate-300 animate-pulse flex items-center justify-center text-slate-500 font-semibold text-xs">
        Loading Map Data...
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-slate-200 h-12 rounded-lg border border-slate-300"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slate-200 h-48 rounded-xl animate-pulse"></div>
  );
};
