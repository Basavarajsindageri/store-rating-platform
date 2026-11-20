import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

const calculatePasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: '', meetsLength: false, meetsUpper: false, meetsSpecial: false };

  const meetsLength = pass.length >= 8 && pass.length <= 16;
  const meetsUpper = /(?=.*[A-Z])/.test(pass);
  const meetsSpecial = /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(pass);
  const hasNumber = /\d/.test(pass);
  const hasLower = /[a-z]/.test(pass);

  let score = 0;
  if (meetsLength) score += 1;
  if (meetsUpper) score += 1;
  if (meetsSpecial) score += 1;
  if (hasNumber && hasLower) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', meetsLength, meetsUpper, meetsSpecial };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', meetsLength, meetsUpper, meetsSpecial };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500', meetsLength, meetsUpper, meetsSpecial };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500', meetsLength, meetsUpper, meetsSpecial };
};

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = null,
  helperText = null,
  required = false,
  disabled = false,
  showStrengthMeter = false,
  showPasswordToggle = false,
  icon: Icon = null,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === 'password';
  const effectiveType = isPasswordField && showPassword ? 'text' : type;
  const strength = isPasswordField && showStrengthMeter ? calculatePasswordStrength(value) : null;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={name}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        </div>
      )}

      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 bg-white dark:bg-slate-900 dark:text-white ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${isPasswordField && showPasswordToggle ? 'pr-11' : 'pr-3.5'} ${
            error
              ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-900/40 bg-rose-50/20'
              : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600 dark:focus:border-indigo-500'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
          {...props}
        />

        {isPasswordField && showPasswordToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Field error message */}
      {error && (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Helper text if no error */}
      {!error && helperText && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      {/* Live Password Strength Meter */}
      {isPasswordField && showStrengthMeter && value && (
        <div className="mt-2.5 space-y-1.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Password Strength:</span>
            <span className={`font-bold ${
              strength.score === 1 ? 'text-rose-600' :
              strength.score === 2 ? 'text-amber-600' :
              strength.score === 3 ? 'text-blue-600' : 'text-emerald-600'
            }`}>
              {strength.label}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 h-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-full rounded-full transition-all duration-300 ${
                  step <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="pt-1 grid grid-cols-1 sm:grid-cols-3 gap-1 text-[10px] text-slate-500 dark:text-slate-400">
            <span className={`flex items-center gap-1 ${strength.meetsLength ? 'text-emerald-600 font-semibold' : ''}`}>
              {strength.meetsLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
              8-16 characters
            </span>
            <span className={`flex items-center gap-1 ${strength.meetsUpper ? 'text-emerald-600 font-semibold' : ''}`}>
              {strength.meetsUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
              1 Uppercase letter
            </span>
            <span className={`flex items-center gap-1 ${strength.meetsSpecial ? 'text-emerald-600 font-semibold' : ''}`}>
              {strength.meetsSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
              1 Special character
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Input;
