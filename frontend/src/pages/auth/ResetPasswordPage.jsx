import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { validatePassword } from '../../utils/validation';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DarkModeToggle from '../../components/common/DarkModeToggle';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenErrorReason, setTokenErrorReason] = useState('');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setTokenErrorReason('Missing reset token');
        setVerifying(false);
        return;
      }

      try {
        const response = await api.get(`/auth/verify-reset-token/${token}`);
        if (response.data.success) {
          setIsTokenValid(true);
        }
      } catch (err) {
        setIsTokenValid(false);
        setTokenErrorReason(
          err.response?.data?.message || 'This password reset link is invalid or has expired'
        );
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const newErrors = {};
    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        setResetSuccess(true);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2500);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || 'Failed to reset password. Please try again.'
        );
      }
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
          {verifying ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Verifying reset token...
              </p>
            </div>
          ) : !isTokenValid ? (
            /* Invalid or Expired Token State */
            <div className="text-center py-4 space-y-5 animate-in fade-in duration-200">
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Invalid or Expired Link
                </h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {tokenErrorReason ||
                    'This password reset link has expired or has already been used. Please request a new one.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Link to="/forgot-password">
                  <Button className="w-full">
                    Request a new reset link
                  </Button>
                </Link>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : resetSuccess ? (
            /* Reset Success State */
            <div className="text-center py-4 space-y-5 animate-in fade-in duration-200">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Password Reset Successfully!
                </h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Your password has been updated. Redirecting you to the sign in page in a moment...
                </p>
              </div>

              <Link to="/login">
                <Button className="w-full">
                  Sign in now
                </Button>
              </Link>
            </div>
          ) : (
            /* Password Reset Form */
            <div className="animate-in fade-in duration-200">
              <div className="flex justify-center mb-4">
                <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-xs">
                  <Lock className="w-8 h-8" />
                </div>
              </div>

              <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Set New Password
              </h2>
              <p className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
                Create a secure password with 8-16 characters, uppercase and special characters.
              </p>

              {serverError && (
                <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  label="New Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8-16 characters"
                  error={errors.password}
                  showPasswordToggle
                  showStrengthMeter
                  required
                />

                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your new password"
                  error={errors.confirmPassword}
                  showPasswordToggle
                  required
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full mt-2"
                >
                  Reset Password
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to sign in
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
