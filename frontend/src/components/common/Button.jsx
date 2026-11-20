import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  theme = 'default', // 'admin' | 'user' | 'owner' | 'default'
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const getVariantClasses = () => {
    if (variant === 'danger') {
      return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-xs hover:shadow';
    }

    if (variant === 'secondary') {
      return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 focus:ring-slate-400 shadow-xs';
    }

    if (variant === 'ghost') {
      return 'bg-transparent hover:bg-slate-100 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 focus:ring-slate-300';
    }

    // Primary variant styled by theme or default
    if (theme === 'admin') {
      return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-xs hover:shadow';
    }
    if (theme === 'user') {
      return 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 shadow-xs hover:shadow';
    }
    if (theme === 'owner') {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-xs hover:shadow';
    }

    return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-xs hover:shadow';
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${getVariantClasses()} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
