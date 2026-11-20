import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { validateEmail } from '../../utils/validation';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DarkModeToggle from '../../components/common/DarkModeToggle';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setFeedbackMessage(
        response.data?.message || 'If this email exists, a reset link has been sent'
      );
      setSubmitted(true);
    } catch (err) {
      // Even on failure, show generic success message to prevent user enumeration
      setFeedbackMessage('If this email exists, a reset link has been sent');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 right-6">
        <DarkModeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-soft rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex justify-center mb-4">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-xs">
              <KeyRound className="w-8 h-8" />
            </div>
          </div>

          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Enter your email address and we'll send you a single-use link to reset your password.
          </p>

          {submitted ? (
            <div className="mt-8 space-y-6 text-center animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-sm flex items-start gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Check your inbox</p>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                    {feedbackMessage}. The link is valid for 15 minutes.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs text-slate-500 text-left space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Didn't receive an email?</p>
                <p>Check your spam folder or verify you entered the email address registered with your account.</p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full"
                >
                  Try another email
                </Button>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="name@example.com"
                icon={Mail}
                error={error}
                required
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
