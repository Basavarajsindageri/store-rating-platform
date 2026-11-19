import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Mail, Lock, User, MapPin, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../../utils/validation';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    const addrErr = validateAddress(formData.address);
    if (addrErr) newErrors.address = addrErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
      });

      navigate('/stores', { replace: true });
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(err.response?.data?.message || err.message || 'Signup failed');
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
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign up to browse, review, and rate your favorite stores
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <span className={`text-[11px] ${formData.name.length >= 20 && formData.name.length <= 60 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {formData.name.length}/60 (min 20)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Katherine Anne Katherine User"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                      : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8-16 chars, 1 uppercase, 1 special char"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                      : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
              <p className="mt-1 text-[11px] text-slate-500">
                8-16 characters, $\ge 1$ uppercase letter, $\ge 1$ special character
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                      : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Address
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.address.length}/400 max
                </span>
              </div>
              <div className="relative">
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your residential / postal address"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.address
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                      : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.address && <p className="mt-1.5 text-xs text-rose-600">{errors.address}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
