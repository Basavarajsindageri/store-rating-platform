import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Star,
  Search,
  MapPin,
  Mail,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/Skeleton';

const UserStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Search and Sort
  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');

  // Rating modal state
  const [ratingModalStore, setRatingModalStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        order,
      };
      if (search) params.search = search;
      if (nameFilter) params.name = nameFilter;
      if (addressFilter) params.address = addressFilter;

      const res = await api.get('/stores', { params });
      if (res.data.success) {
        setStores(res.data.data);
        setTotalPages(res.data.meta.totalPages);
        setTotalItems(res.data.meta.total);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, order, search, nameFilter, addressFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleOpenRatingModal = (store) => {
    setRatingModalStore(store);
    setSelectedRating(store.userRating || 5);
    setRatingError('');
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setRatingError('Please select a star rating between 1 and 5');
      return;
    }

    setSubmittingRating(true);
    setRatingError('');

    try {
      const res = await api.post(`/stores/${ratingModalStore.id}/rating`, {
        rating: selectedRating,
      });

      if (res.data.success) {
        showToast(
          ratingModalStore.userRating
            ? `Your rating for "${ratingModalStore.name}" was updated to ${selectedRating} ★`
            : `Thank you! You rated "${ratingModalStore.name}" ${selectedRating} ★`
        );

        const updatedStats = res.data.data.storeStats;
        setStores((prevStores) =>
          prevStores.map((s) =>
            s.id === ratingModalStore.id
              ? {
                  ...s,
                  userRating: selectedRating,
                  averageRating: updatedStats.averageRating,
                  ratingCount: updatedStats.ratingCount,
                }
              : s
          )
        );

        setRatingModalStore(null);
      }
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <UserLayout>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-soft bg-teal-600 text-white text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-0.5 hover:bg-teal-700 rounded-lg ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Search Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-soft mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-md mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Verified Customer Reviews
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
            Discover & Rate Stores
          </h1>
          <p className="mt-2 text-teal-100 text-xs sm:text-sm leading-relaxed">
            Find nearby registered stores, browse community ratings, and share your personal experience.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-center">
          <Star className="w-80 h-80 fill-white" />
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Main search input */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/40 focus:border-teal-600"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/40 focus:border-teal-600"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by address..."
              value={addressFilter}
              onChange={(e) => {
                setAddressFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/40 focus:border-teal-600"
            />
          </div>

          <div>
            <select
              value={`${sortBy}:${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split(':');
                setSortBy(newSort);
                setOrder(newOrder);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/40 focus:border-teal-600"
            >
              <option value="name:ASC">Sort: Name (A - Z)</option>
              <option value="name:DESC">Sort: Name (Z - A)</option>
              <option value="rating:DESC">Sort: Highest Rating</option>
              <option value="rating:ASC">Sort: Lowest Rating</option>
              <option value="address:ASC">Sort: Address (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-soft">
          <Store className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No stores found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-soft hover:shadow-lg transition-all duration-200 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl group-hover:scale-105 transition-transform shadow-xs">
                    <Store className="w-6 h-6" />
                  </div>

                  {/* Overall Rating Badge */}
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800/80">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-amber-200">
                      {parseFloat(store.averageRating) > 0
                        ? parseFloat(store.averageRating).toFixed(1)
                        : 'New'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({store.ratingCount || 0})
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {store.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{store.email}</span>
                  </div>
                </div>
              </div>

              {/* Rating Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Your Rating
                  </span>
                  {store.userRating ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarRating value={store.userRating} readOnly={true} size="sm" />
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                        {store.userRating} ★
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic mt-0.5">Not rated yet</span>
                  )}
                </div>

                <Button
                  variant={store.userRating ? 'secondary' : 'primary'}
                  theme="user"
                  size="sm"
                  onClick={() => handleOpenRatingModal(store)}
                >
                  {store.userRating ? 'Modify Rating' : 'Rate Store'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Interactive Rating Modal */}
      {ratingModalStore && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-center border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setRatingModalStore(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-500 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center mb-4 shadow-xs">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
            </div>

            <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white leading-tight">
              {ratingModalStore.userRating ? 'Update Your Rating' : 'Rate this Store'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {ratingModalStore.name}
            </p>

            {ratingError && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
                {ratingError}
              </div>
            )}

            <form onSubmit={handleSubmitRating} className="mt-6">
              <div className="py-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center mb-6">
                <StarRating
                  value={selectedRating}
                  onChange={(val) => setSelectedRating(val)}
                  readOnly={false}
                  size="lg"
                />
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-3">
                  {selectedRating} out of 5 Stars
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Click any star to choose score
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  className="w-1/2"
                  onClick={() => setRatingModalStore(null)}
                  disabled={submittingRating}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  theme="user"
                  className="w-1/2"
                  loading={submittingRating}
                >
                  Save Rating
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserStoresPage;
