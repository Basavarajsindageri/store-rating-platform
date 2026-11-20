import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Building2,
  X,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/axios';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';
import Button from '../../components/common/Button';
import { Skeleton, SkeletonTableRows } from '../../components/common/Skeleton';
import AddUserModal from '../../components/admin/AddUserModal';
import AddStoreModal from '../../components/admin/AddStoreModal';
import UserDetailsModal from '../../components/admin/UserDetailsModal';

const AdminDashboardPage = () => {
  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Tabs: 'dashboard' | 'stores' | 'users'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Stores table state
  const [stores, setStores] = useState([]);
  const [storesTotal, setStoresTotal] = useState(0);
  const [storesPage, setStoresPage] = useState(1);
  const [storesLimit] = useState(10);
  const [storesTotalPages, setStoresTotalPages] = useState(1);
  const [storesSortBy, setStoresSortBy] = useState('createdAt');
  const [storesOrder, setStoresOrder] = useState('DESC');
  const [storesFilters, setStoresFilters] = useState({ search: '', name: '', email: '', address: '' });
  const [loadingStores, setLoadingStores] = useState(false);

  // Users table state
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit] = useState(10);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSortBy, setUsersSortBy] = useState('createdAt');
  const [usersOrder, setUsersOrder] = useState('DESC');
  const [usersFilters, setUsersFilters] = useState({ search: '', name: '', email: '', address: '', role: '' });
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  // Toast / notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch stores
  const fetchStores = useCallback(async () => {
    try {
      setLoadingStores(true);
      const params = {
        page: storesPage,
        limit: storesLimit,
        sortBy: storesSortBy,
        order: storesOrder,
      };
      if (storesFilters.search) params.search = storesFilters.search;
      if (storesFilters.name) params.name = storesFilters.name;
      if (storesFilters.email) params.email = storesFilters.email;
      if (storesFilters.address) params.address = storesFilters.address;

      const res = await api.get('/admin/stores', { params });
      if (res.data.success) {
        setStores(res.data.data);
        setStoresTotal(res.data.meta.total);
        setStoresTotalPages(res.data.meta.totalPages);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoadingStores(false);
    }
  }, [storesPage, storesLimit, storesSortBy, storesOrder, storesFilters]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const params = {
        page: usersPage,
        limit: usersLimit,
        sortBy: usersSortBy,
        order: usersOrder,
      };
      if (usersFilters.search) params.search = usersFilters.search;
      if (usersFilters.name) params.name = usersFilters.name;
      if (usersFilters.email) params.email = usersFilters.email;
      if (usersFilters.address) params.address = usersFilters.address;
      if (usersFilters.role) params.role = usersFilters.role;

      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.data);
        setUsersTotal(res.data.meta.total);
        setUsersTotalPages(res.data.meta.totalPages);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [usersPage, usersLimit, usersSortBy, usersOrder, usersFilters]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'stores' || activeTab === 'dashboard') {
      fetchStores();
    }
    if (activeTab === 'users' || activeTab === 'dashboard') {
      fetchUsers();
    }
  }, [activeTab, fetchStores, fetchUsers]);

  const handleStoreSort = (column) => {
    if (storesSortBy === column) {
      setStoresOrder(storesOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setStoresSortBy(column);
      setStoresOrder('ASC');
    }
    setStoresPage(1);
  };

  const handleUserSort = (column) => {
    if (usersSortBy === column) {
      setUsersOrder(usersOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setUsersSortBy(column);
      setUsersOrder('ASC');
    }
    setUsersPage(1);
  };

  const renderSortIcon = (currentSort, currentOrder, column) => {
    if (currentSort !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-30 group-hover:opacity-100 transition-opacity" />;
    }
    return currentOrder === 'ASC' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    );
  };

  return (
    <AdminLayout
      activeSection={activeTab}
      onSelectSection={setActiveTab}
      onOpenAddUser={() => setIsAddUserOpen(true)}
      onOpenAddStore={() => setIsAddStoreOpen(true)}
    >
      {/* Toast alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-soft bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-0.5 hover:bg-emerald-700 rounded-lg ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner / Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            System Administration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics and management for registered stores and user accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsAddUserOpen(true)}
            icon={Plus}
          >
            Add User
          </Button>

          <Button
            theme="admin"
            onClick={() => setIsAddStoreOpen(true)}
            icon={Plus}
          >
            Add Store
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-center gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Users
            </p>
            {loadingStats ? (
              <Skeleton className="w-16 h-8 mt-1 rounded-lg" />
            ) : (
              <p className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalUsers}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-center gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-xs">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Stores
            </p>
            {loadingStats ? (
              <Skeleton className="w-16 h-8 mt-1 rounded-lg" />
            ) : (
              <p className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalStores}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-center gap-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/60 text-amber-500 rounded-2xl shadow-xs">
            <Star className="w-7 h-7 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Ratings
            </p>
            {loadingStats ? (
              <Skeleton className="w-16 h-8 mt-1 rounded-lg" />
            ) : (
              <p className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalRatings}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation in Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 pt-4 flex gap-6">
          <button
            onClick={() => setActiveTab('stores')}
            className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'stores' || activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            Stores Directory ({storesTotal})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Users Directory ({usersTotal})
          </button>
        </div>

        {/* TAB 1: STORES */}
        {(activeTab === 'stores' || activeTab === 'dashboard') && (
          <div className="p-6">
            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={storesFilters.search}
                  onChange={(e) => {
                    setStoresFilters((prev) => ({ ...prev, search: e.target.value }));
                    setStoresPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600"
                />
              </div>

              <input
                type="text"
                placeholder="Filter by name..."
                value={storesFilters.name}
                onChange={(e) => {
                  setStoresFilters((prev) => ({ ...prev, name: e.target.value }));
                  setStoresPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600"
              />

              <input
                type="text"
                placeholder="Filter by email..."
                value={storesFilters.email}
                onChange={(e) => {
                  setStoresFilters((prev) => ({ ...prev, email: e.target.value }));
                  setStoresPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600"
              />

              <input
                type="text"
                placeholder="Filter by address..."
                value={storesFilters.address}
                onChange={(e) => {
                  setStoresFilters((prev) => ({ ...prev, address: e.target.value }));
                  setStoresPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600"
              />
            </div>

            {/* Stores Table with Zebra rows */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider sticky top-0">
                  <tr>
                    <th
                      onClick={() => handleStoreSort('name')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Store Name</span>
                        {renderSortIcon(storesSortBy, storesOrder, 'name')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleStoreSort('email')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Email</span>
                        {renderSortIcon(storesSortBy, storesOrder, 'email')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleStoreSort('address')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Address</span>
                        {renderSortIcon(storesSortBy, storesOrder, 'address')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleStoreSort('rating')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Rating (Avg)</span>
                        {renderSortIcon(storesSortBy, storesOrder, 'rating')}
                      </div>
                    </th>
                    <th className="py-3 px-4">Assigned Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                  {loadingStores ? (
                    <SkeletonTableRows count={5} cols={5} />
                  ) : stores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <Store className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-semibold">No stores match your filters</p>
                      </td>
                    </tr>
                  ) : (
                    stores.map((s, idx) => (
                      <tr
                        key={s.id}
                        className={`transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 ${
                          idx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{s.email}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={s.address}>
                          {s.address}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <StarRating
                              value={parseFloat(s.averageRating) || 0}
                              readOnly={true}
                              size="sm"
                            />
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {parseFloat(s.averageRating) > 0
                                ? parseFloat(s.averageRating).toFixed(1)
                                : 'No rating'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({s.ratingCount || 0})
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {s.owner ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                              <Building2 className="w-3.5 h-3.5" />
                              {s.owner.name}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={storesPage}
              totalPages={storesTotalPages}
              totalItems={storesTotal}
              limit={storesLimit}
              onPageChange={(p) => setStoresPage(p)}
            />
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="p-6">
            {/* User filters */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={usersFilters.search}
                  onChange={(e) => {
                    setUsersFilters((prev) => ({ ...prev, search: e.target.value }));
                    setUsersPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600"
                />
              </div>

              <input
                type="text"
                placeholder="Filter by name..."
                value={usersFilters.name}
                onChange={(e) => {
                  setUsersFilters((prev) => ({ ...prev, name: e.target.value }));
                  setUsersPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600"
              />

              <input
                type="text"
                placeholder="Filter by email..."
                value={usersFilters.email}
                onChange={(e) => {
                  setUsersFilters((prev) => ({ ...prev, email: e.target.value }));
                  setUsersPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600"
              />

              <input
                type="text"
                placeholder="Filter by address..."
                value={usersFilters.address}
                onChange={(e) => {
                  setUsersFilters((prev) => ({ ...prev, address: e.target.value }));
                  setUsersPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600"
              />

              <select
                value={usersFilters.role}
                onChange={(e) => {
                  setUsersFilters((prev) => ({ ...prev, role: e.target.value }));
                  setUsersPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600"
              >
                <option value="">All Roles</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="NORMAL_USER">Normal User</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider sticky top-0">
                  <tr>
                    <th
                      onClick={() => handleUserSort('name')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>User Name</span>
                        {renderSortIcon(usersSortBy, usersOrder, 'name')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleUserSort('email')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Email</span>
                        {renderSortIcon(usersSortBy, usersOrder, 'email')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleUserSort('address')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Address</span>
                        {renderSortIcon(usersSortBy, usersOrder, 'address')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleUserSort('role')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Role</span>
                        {renderSortIcon(usersSortBy, usersOrder, 'role')}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                  {loadingUsers ? (
                    <SkeletonTableRows count={5} cols={5} />
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-semibold">No users match your filters</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((u, idx) => (
                      <tr
                        key={u.id}
                        className={`transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 ${
                          idx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={u.address}>
                          {u.address}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              u.role === 'SYSTEM_ADMIN'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : u.role === 'STORE_OWNER'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setIsUserDetailsOpen(true);
                            }}
                            icon={Eye}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={usersPage}
              totalPages={usersTotalPages}
              totalItems={usersTotal}
              limit={usersLimit}
              onPageChange={(p) => setUsersPage(p)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={() => {
          showToast('User created successfully');
          fetchUsers();
          fetchStats();
        }}
      />

      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreAdded={() => {
          showToast('Store created successfully');
          fetchStores();
          fetchStats();
        }}
      />

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isUserDetailsOpen}
        onClose={() => {
          setIsUserDetailsOpen(false);
          setSelectedUserId(null);
        }}
      />
    </AdminLayout>
  );
};

export default AdminDashboardPage;
