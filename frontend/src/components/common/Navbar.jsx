import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  LogOut,
  KeyRound,
  User as UserIcon,
  Store,
  Users,
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeConfig = {
    SYSTEM_ADMIN: {
      label: 'Admin',
      classes: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: ShieldCheck,
    },
    STORE_OWNER: {
      label: 'Store Owner',
      classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Building2,
    },
    NORMAL_USER: {
      label: 'User',
      classes: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: UserIcon,
    },
  };

  const badge = user ? roleBadgeConfig[user.role] : null;
  const RoleIcon = badge?.icon || UserIcon;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                  <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    StoreRate
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                    Platform
                  </span>
                </div>
              </Link>

              {/* Role-based desktop links */}
              {user && (
                <nav className="hidden md:flex items-center gap-1">
                  {user.role === 'SYSTEM_ADMIN' && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          isActive('/admin/dashboard')
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Console
                      </Link>
                    </>
                  )}

                  {user.role === 'NORMAL_USER' && (
                    <Link
                      to="/stores"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/stores')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      Browse & Rate Stores
                    </Link>
                  )}

                  {user.role === 'STORE_OWNER' && (
                    <Link
                      to="/owner/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/owner/dashboard')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Store Dashboard
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* User profile & actions */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      {user.email}
                    </span>
                  </div>
                  {badge && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.classes}`}
                    >
                      <RoleIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100"
                  title="Change Password"
                >
                  <KeyRound className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            {user && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                {badge && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1">
              {user?.role === 'SYSTEM_ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Admin Console
                </Link>
              )}
              {user?.role === 'NORMAL_USER' && (
                <Link
                  to="/stores"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Browse & Rate Stores
                </Link>
              )}
              {user?.role === 'STORE_OWNER' && (
                <Link
                  to="/owner/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Store Dashboard
                </Link>
              )}
            </div>

            {user ? (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  Change Password
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
