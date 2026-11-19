import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-6 text-slate-500 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-indigo-600 mb-2`} />
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
