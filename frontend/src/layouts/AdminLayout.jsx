import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  UserPlus,
  PlusCircle,
  ShieldCheck,
  LogOut,
  KeyRound,
  Menu,
  X,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from '../components/common/DarkModeToggle';
import ChangePasswordModal from '../components/common/ChangePasswordModal';

const AdminLayout = ({
  children,
  activeSection = 'dashboard',
  onSelectSection,
  onOpenAddUser,
  onOpenAddStore,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Stats', icon: LayoutDashboard },
    { id: 'stores', label: 'Stores Directory', icon: Store },
    { id: 'users', label: 'Users Directory', icon: Users },
  ];

  return (
    <div data-theme="admin" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col page-transition">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Dark Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-xs text-white">
                <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <span className="font-heading font-bold text-white text-base tracking-tight block">
                  StoreRate
                </span>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest block">
                  Admin Panel
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Management
            </p>

            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (onSelectSection) onSelectSection(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <ItemIcon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-5 pb-2">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Actions
              </p>

              <button
                type="button"
                onClick={() => {
                  if (onOpenAddUser) onOpenAddUser();
                  setMobileSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Add New User</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenAddStore) onOpenAddStore();
                  setMobileSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Add New Store</span>
              </button>
            </div>
          </div>
        </div>

        {/* User profile footer in sidebar */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <span className="p-1 bg-indigo-500/20 text-indigo-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
        </div>
      </aside>

      {/* Main Topbar */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 md:ml-64 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white leading-tight">
              {activeSection === 'dashboard' ? 'Admin Overview' : activeSection === 'stores' ? 'Stores Management' : 'Users Directory'}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Role: System Administrator
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <DarkModeToggle />

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors"
            title="Change Password"
            aria-label="Change password"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="md:ml-64 flex-1 p-4 sm:p-8 bg-slate-50 dark:bg-slate-950">
        {children}
      </main>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
