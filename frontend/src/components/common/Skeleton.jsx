import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-20 h-6 rounded-lg" />
      </div>
      <Skeleton className="w-3/4 h-5 rounded-md" />
      <Skeleton className="w-full h-4 rounded-md" />
      <Skeleton className="w-1/2 h-4 rounded-md" />
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <Skeleton className="w-24 h-4 rounded-md" />
        <Skeleton className="w-20 h-8 rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonTableRows = ({ count = 5, cols = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="py-4 px-4">
              <Skeleton className="h-4 w-full max-w-[140px] rounded-md" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default Skeleton;
