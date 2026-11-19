import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Star,
  Search,
  MapPin,
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

        // Optimistically update the store in the current list
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Floating notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg bg-indigo-600 text-white text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-0.5 hover:bg-indigo-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-indigo-950/10 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Community Store Reviews
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Explore & Rate Stores
            </h1>
            <p className="mt-2 text-indigo-200 text-sm sm:text-base leading-relaxed">
              Find local registered stores, explore verified community ratings, and share your own rating experience.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-center">
            <Star className="w-80 h-80 fill-white" />
          </div>
        </div>

        {/* Search, Filter, and Sort Toolbar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
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
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            {/* Filter by Name */}
            <div>
              <input
                type="text"
                placeholder="Filter by name..."
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            {/* Filter by Address */}
            <div>
              <input
                type="text"
                placeholder="Filter by address..."
                value={addressFilter}
                onChange={(e) => {
                  setAddressFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}:${order}`}
                onChange={(e) => {
                  const [newSort, newOrder] = e.target.value.split(':');
                  setSortBy(newSort);
                  setOrder(newOrder);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white text-slate-700"
              >
                <option value="name:ASC">Name (A - Z)</option>
                <option value="name:DESC">Name (Z - A)</option>
                <option value="rating:DESC">Rating (Highest first)</option>
                <option value="rating:ASC">Rating (Lowest first)</option>
                <option value="address:ASC">Address (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stores Grid / Cards */}
        {loading ? (
          <div className="py-20 text-center">
            <LoadingSpinner text="Loading stores..." size="lg" />
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No stores found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              No registered stores matched your current search and filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
                      <Store className="w-6 h-6" />
                    </div>

                    {/* Overall Rating Badge */}
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-900">
                        {parseFloat(store.averageRating) > 0
                          ? parseFloat(store.averageRating).toFixed(1)
                          : 'New'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({store.ratingCount || 0})
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {store.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
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

                {/* Rating Footer Area */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Your Rating
                    </span>
                    {store.userRating ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <StarRating value={store.userRating} readOnly={true} size="sm" />
                        <span className="text-xs font-bold text-indigo-600">
                          {store.userRating} ★
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic mt-0.5">Not rated yet</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenRatingModal(store)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                      store.userRating
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {store.userRating ? 'Modify Rating' : 'Rate Store'}
                  </button>
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
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </main>

      {/* Interactive Rating Modal */}
      {ratingModalStore && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
            <button
              onClick={() => setRatingModalStore(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center mb-4">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {ratingModalStore.userRating ? 'Update Your Rating' : 'Rate this Store'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {ratingModalStore.name}
            </p>

            {ratingError && (
              <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {ratingError}
              </div>
            )}

            <form onSubmit={handleSubmitRating} className="mt-6">
              <div className="py-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center mb-6">
                <StarRating
                  value={selectedRating}
                  onChange={(val) => setSelectedRating(val)}
                  readOnly={false}
                  size="lg"
                />
                <span className="text-sm font-extrabold text-slate-800 mt-3">
                  {selectedRating} out of 5 Stars
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Click on any star to select your score
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRatingModalStore(null)}
                  disabled={submittingRating}
                  className="w-1/2 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingRating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submittingRating ? 'Saving...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStoresPage;
