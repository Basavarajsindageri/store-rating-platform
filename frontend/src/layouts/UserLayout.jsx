import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Store,
  KeyRound,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from '../components/common/DarkModeToggle';
import ChangePasswordModal from '../components/common/ChangePasswordModal';

const UserLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div data-theme="user" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col page-transition">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link to="/stores" className="flex items-center gap-2.5 group">
                <div className="p-2 bg-gradient-to-tr from-teal-600 to-teal-500 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                  <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <span className="font-heading font-bold text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-teal-600 transition-colors block">
                    StoreRate
                  </span>
                  <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest block">
                    Community Reviews
                  </span>
                </div>
              </Link>

              <nav className="hidden sm:flex items-center gap-2">
                <Link
                  to="/stores"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 flex items-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  Explore Stores
                </Link>
              </nav>
            </div>

            {/* Profile & Controls */}
            <div className="flex items-center gap-2.5">
              <DarkModeToggle />

              {/* User badge */}
              <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left text-xs max-w-[130px] truncate">
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {user?.name}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-2 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-colors"
                title="Change Password"
                aria-label="Change password"
              >
                <KeyRound className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default UserLayout;
