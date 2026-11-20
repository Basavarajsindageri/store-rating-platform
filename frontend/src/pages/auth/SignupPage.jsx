import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, MapPin, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../../utils/validation';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DarkModeToggle from '../../components/common/DarkModeToggle';

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
    <div
      data-theme="user"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative transition-colors duration-200"
    >
      <div className="absolute top-6 right-6">
        <DarkModeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-soft rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3.5 bg-teal-600 text-white rounded-2xl shadow-sm mb-3">
              <User className="w-7 h-7" />
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800 mb-2">
              <Sparkles className="w-3 h-3" />
              Community Reviewer Registration
            </span>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create an Account
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Join thousands of community shoppers to discover, review, and rate stores
            </p>
          </div>

          {serverError && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Katherine Anne User Account"
              icon={User}
              error={errors.name}
              helperText={`${formData.name.length}/60 characters (min 20)`}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              icon={Mail}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8-16 characters"
              icon={Lock}
              error={errors.password}
              showPasswordToggle
              showStrengthMeter
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              icon={Lock}
              error={errors.confirmPassword}
              showPasswordToggle
              required
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Address <span className="text-rose-500">*</span>
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
                  placeholder="Your street address"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 bg-white dark:bg-slate-900 dark:text-white ${
                    errors.address
                      ? 'border-rose-300 dark:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-teal-100 focus:border-teal-600'
                  }`}
                />
              </div>
              {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
            </div>

            <Button
              type="submit"
              theme="user"
              loading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
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
