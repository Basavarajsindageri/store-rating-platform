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
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return order === 'ASC' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
    );
  };

  if (loadingDashboard) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner text="Loading your store dashboard..." size="lg" />
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.hasStore) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex items-center justify-center">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">No Store Assigned Yet</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Your account currently does not have a registered store assigned to it. Please contact the System Administrator to assign your store.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { store, breakdown } = dashboardData;
  const avgRating = parseFloat(store.averageRating) || 0;
  const totalReviews = parseInt(store.ratingCount, 10) || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-teal-950/10 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-md mb-4 border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              Owner Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
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
            <Star className="w-80 h-80 fill-white" />
          </div>
        </div>

        {/* Store Ratings Performance & Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Average Rating
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-slate-400 text-sm font-semibold">/ 5.0</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <StarRating value={avgRating} readOnly={true} size="md" />
              <span className="text-xs font-semibold text-slate-500">
                {totalReviews} verified {totalReviews === 1 ? 'rating' : 'ratings'}
              </span>
            </div>
          </div>

          {/* Rating Distribution Breakdown */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Rating Distribution Breakdown
            </p>

            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = breakdown?.[stars] || 0;
                const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                      {stars} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-medium text-slate-500">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Users Who Rated The Store Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Customer Ratings & Reviews
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed record of all users who submitted a rating for your store
              </p>
            </div>

            {/* Search user */}
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
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-6 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer Name</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className="py-3 px-6 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer Email</span>
                      {renderSortIcon('email')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('rating')}
                    className="py-3 px-6 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Rating Given</span>
                      {renderSortIcon('rating')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="py-3 px-6 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Submitted Date</span>
                      {renderSortIcon('createdAt')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingRatings ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <LoadingSpinner text="Loading customer ratings..." />
                    </td>
                  </tr>
                ) : ratings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      No ratings submitted yet for your store.
                    </td>
                  </tr>
                ) : (
                  ratings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {item.user?.name || 'Anonymous User'}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {item.user?.email || 'N/A'}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <StarRating value={item.rating} readOnly={true} size="sm" />
                          <span className="font-bold text-slate-900 text-xs">
                            {item.rating} ★
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
      </main>
    </div>
  );
};

export default OwnerDashboardPage;
