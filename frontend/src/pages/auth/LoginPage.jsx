import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Store,
  User as UserIcon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DarkModeToggle from '../../components/common/DarkModeToggle';

const LoginPage = () => {
  // Cosmetic role switcher: 'admin' | 'user' | 'owner'
  const [selectedThemeRole, setSelectedThemeRole] = useState('user');

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [softNotice, setSoftNotice] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const themeConfig = {
    admin: {
      key: 'admin',
      label: 'Admin',
      badge: 'System Administrator',
      badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      heading: 'System Admin Console',
      subheading: 'Access system metrics, manage platform stores, and oversee user accounts',
      accentColor: 'indigo',
      btnTheme: 'admin',
      icon: ShieldCheck,
      iconBg: 'bg-indigo-600 text-white',
    },
    user: {
      key: 'user',
      label: 'User',
      badge: 'Community Shopper',
      badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      heading: 'Welcome Back!',
      subheading: 'Discover local registered stores, explore verified reviews, and submit your ratings',
      accentColor: 'teal',
      btnTheme: 'user',
      icon: UserIcon,
      iconBg: 'bg-teal-600 text-white',
    },
    owner: {
      key: 'owner',
      label: 'Store Owner',
      badge: 'Store Business Portal',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      heading: 'Store Owner Portal',
      subheading: 'Monitor your customer ratings, inspect reviews, and review performance analytics',
      accentColor: 'emerald',
      btnTheme: 'owner',
      icon: Store,
      iconBg: 'bg-emerald-600 text-white',
    },
  };

  const currentTheme = themeConfig[selectedThemeRole];
  const ThemeIcon = currentTheme.icon;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError('');
  };

  const handleFillDemo = (email, password, themeTab) => {
    setFormData({ email, password });
    setSelectedThemeRole(themeTab);
    setErrors({});
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSoftNotice('');

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

      // Check if logged in user's role matches cosmetic tab
      const roleMap = {
        SYSTEM_ADMIN: 'admin',
        NORMAL_USER: 'user',
        STORE_OWNER: 'owner',
      };

      const realRoleKey = roleMap[loggedUser.role];
      const roleReadableName = {
        SYSTEM_ADMIN: 'System Administrator',
        NORMAL_USER: 'Normal User',
        STORE_OWNER: 'Store Owner',
      }[loggedUser.role];

      const redirectUser = () => {
        if (loggedUser.role === 'SYSTEM_ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (loggedUser.role === 'STORE_OWNER') {
          navigate('/owner/dashboard', { replace: true });
        } else {
          const from = location.state?.from?.pathname || '/stores';
          navigate(from, { replace: true });
        }
      };

      if (realRoleKey !== selectedThemeRole) {
        setSoftNotice(`You're signed in as ${roleReadableName}. Redirecting to your dashboard...`);
        setTimeout(redirectUser, 1200);
      } else {
        redirectUser();
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
    <div
      data-theme={selectedThemeRole}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative transition-colors duration-200"
    >
      <div className="absolute top-6 right-6">
        <DarkModeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* Role Segmented Switcher */}
        <div className="mb-6 p-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-2xl flex items-center shadow-xs">
          {Object.values(themeConfig).map((tab) => {
            const isSelected = selectedThemeRole === tab.key;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedThemeRole(tab.key)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs scale-102'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-soft rounded-3xl border border-slate-200/80 dark:border-slate-800 transition-all duration-200">
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`p-3.5 ${currentTheme.iconBg} rounded-2xl shadow-sm mb-3 transition-colors duration-200`}>
              <ThemeIcon className="w-7 h-7" />
            </div>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border mb-2 ${currentTheme.badgeClass}`}
            >
              <Sparkles className="w-3 h-3" />
              {currentTheme.badge}
            </span>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentTheme.heading}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {currentTheme.subheading}
            </p>
          </div>

          {/* Soft Notice on Role Mismatch */}
          {softNotice && (
            <div className="mb-5 p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{softNotice}</span>
            </div>
          )}

          {serverError && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                error={errors.password}
                showPasswordToggle
                required
              />

              {/* Forgot password link directly under password */}
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              theme={currentTheme.btnTheme}
              loading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          {/* Signup link appears ONLY on User theme */}
          {selectedThemeRole === 'user' && (
            <div className="mt-6 text-center pt-5 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                New to the platform?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Create customer account
                </Link>
              </p>
            </div>
          )}

          {/* Quick Fill Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Fill Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@example.com', 'Admin@1234', 'admin')}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 rounded-xl text-left transition-colors flex flex-col items-center text-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Admin</span>
                <span className="text-[9px] text-slate-400">admin@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('christopher@example.com', 'User@1234', 'user')}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 rounded-xl text-left transition-colors flex flex-col items-center text-center"
              >
                <UserIcon className="w-3.5 h-3.5 text-teal-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">User</span>
                <span className="text-[9px] text-slate-400">christopher@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('alex.owner@example.com', 'Owner@1234', 'owner')}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 rounded-xl text-left transition-colors flex flex-col items-center text-center"
              >
                <Store className="w-3.5 h-3.5 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Owner</span>
                <span className="text-[9px] text-slate-400">alex.owner@...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
