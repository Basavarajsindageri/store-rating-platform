import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Star,
  Users,
  Calendar,
  Mail,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axios';
import OwnerLayout from '../../layouts/OwnerLayout';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import { Skeleton, SkeletonTableRows } from '../../components/common/Skeleton';

const OwnerDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Ratings table state
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting & Filtering
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('DESC');

  const fetchDashboard = async () => {
    try {
      setLoadingDashboard(true);
      const res = await api.get('/owner/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchRatings = useCallback(async () => {
    try {
      setLoadingRatings(true);
      const params = {
        page,
        limit,
        sortBy,
        order,
      };
      if (search) params.search = search;

      const res = await api.get('/owner/ratings', { params });
      if (res.data.success) {
        setRatings(res.data.data);
        setTotalPages(res.data.meta.totalPages);
        setTotalItems(res.data.meta.total);
      }
    } catch (err) {
      console.error('Failed to load store ratings:', err);
    } finally {
      setLoadingRatings(false);
    }
  }, [page, limit, sortBy, order, search]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (dashboardData?.hasStore) {
      fetchRatings();
    }
  }, [dashboardData?.hasStore, fetchRatings]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
    setPage(1);
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-30 group-hover:opacity-100 transition-opacity" />;
    }
    return order === 'ASC' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
    );
  };

  if (loadingDashboard) {
    return (
      <OwnerLayout>
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 md:col-span-2 rounded-3xl" />
          </div>
        </div>
      </OwnerLayout>
    );
  }

  if (!dashboardData || !dashboardData.hasStore) {
    return (
      <OwnerLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-soft">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white">
              No Store Assigned Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Your store owner account currently does not have a registered store assigned to it.
              Please contact the System Administrator to link your business location.
            </p>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  const { store, breakdown } = dashboardData;
  const avgRating = parseFloat(store.averageRating) || 0;
  const totalReviews = parseInt(store.ratingCount, 10) || 0;

  return (
    <OwnerLayout activeTab="store">
      {/* Store Header Hero */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-soft mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-md mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Store Management Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight">
            {store.name}
          </h1>
          <div className="mt-3 space-y-1 text-xs sm:text-sm text-emerald-100 flex flex-col sm:flex-row sm:items-center sm:gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              {store.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
              {store.email}
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-center">
          <Building2 className="w-80 h-80 fill-white" />
        </div>
      </div>

      {/* Average Rating Card & Rating Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Big Average Rating Hero Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall Store Rating
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-heading font-extrabold text-slate-900 dark:text-white">
                {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-slate-400 text-base font-semibold">/ 5.0</span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <StarRating value={avgRating} readOnly={true} size="md" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {totalReviews} verified {totalReviews === 1 ? 'rating' : 'ratings'}
            </span>
          </div>
        </div>

        {/* Rating Distribution Bar Chart */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5">
            Rating Distribution Breakdown
          </p>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = breakdown?.[stars] || 0;
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-14 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    {stars} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </span>
                  <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-medium text-slate-500 dark:text-slate-400">
                    {count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Ratings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
              Customer Reviews & Ratings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customers who have rated your business
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviewer name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider sticky top-0">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="py-3 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer Email</span>
                    {renderSortIcon('email')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('rating')}
                  className="py-3 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rating Given</span>
                    {renderSortIcon('rating')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('createdAt')}
                  className="py-3 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted Date</span>
                    {renderSortIcon('createdAt')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
              {loadingRatings ? (
                <SkeletonTableRows count={5} cols={4} />
              ) : ratings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold">No customer ratings submitted yet</p>
                  </td>
                </tr>
              ) : (
                ratings.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 ${
                      idx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                      {item.user?.name || 'Customer Reviewer'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300">
                      {item.user?.email || 'N/A'}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <StarRating value={item.rating} readOnly={true} size="sm" />
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {item.rating} ★
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </OwnerLayout>
  );
};

export default OwnerDashboardPage;
