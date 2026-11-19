import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, Mail, Lock, AlertCircle, Loader2, ArrowRight, ShieldCheck, Store, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError('');
  };

  const handleFillDemo = (email, password) => {
    setFormData({ email, password });
    setErrors({});
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const newErrors = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(formData.email, formData.password);

      // Role-based redirect
      if (loggedUser.role === 'SYSTEM_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser.role === 'STORE_OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/stores';
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(err.response?.data?.message || err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
            <Star className="w-8 h-8 fill-amber-300 text-amber-300" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Store Rating Platform
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to your account to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          {serverError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                      : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                      : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Quick Fill Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@example.com', 'Admin@1234')}
                className="p-2 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 rounded-xl text-left transition-colors flex flex-col items-center text-center group"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Admin</span>
                <span className="text-[9px] text-slate-400">admin@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('alex.owner@example.com', 'Owner@1234')}
                className="p-2 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-xl text-left transition-colors flex flex-col items-center text-center group"
              >
                <Store className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Owner</span>
                <span className="text-[9px] text-slate-400">alex.owner@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('christopher@example.com', 'User@1234')}
                className="p-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-xl text-left transition-colors flex flex-col items-center text-center group"
              >
                <User className="w-4 h-4 text-indigo-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">User</span>
                <span className="text-[9px] text-slate-400">christopher@...</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign up as normal user
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
