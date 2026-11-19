import React, { useState, useEffect } from 'react';
import { X, User, Building2, Star, Mail, MapPin, Calendar, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import StarRating from '../common/StarRating';

const UserDetailsModal = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserDetails = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await api.get(`/admin/users/${userId}`);
          if (response.data.success) {
            setUser(response.data.data);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load user details');
        } finally {
          setLoading(false);
        }
      };
      fetchUserDetails();
    } else {
      setUser(null);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const roleStyles = {
    SYSTEM_ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
    STORE_OWNER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    NORMAL_USER: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">User Profile Details</h3>
            <p className="text-xs text-slate-500">Comprehensive user account information</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm text-slate-500">Loading user profile...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm border border-rose-200">
            {error}
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">{user.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                    roleStyles[user.role] || 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-start gap-2 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{user.address}</span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined on {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* If Store Owner, show owned store & average rating */}
            {user.role === 'STORE_OWNER' && (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <h5 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                    Assigned Store Information
                  </h5>
                </div>

                {user.store ? (
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Store Name</p>
                      <p className="text-sm font-bold text-slate-900">{user.store.name}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Store Email</span>
                        <span className="text-slate-700 font-semibold">{user.store.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Address</span>
                        <span className="text-slate-700 truncate block">{user.store.address}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Overall Rating</span>
                      <div className="flex items-center gap-2">
                        <StarRating
                          value={parseFloat(user.store.averageRating) || 0}
                          readOnly={true}
                          size="sm"
                        />
                        <span className="text-xs font-bold text-slate-900">
                          {parseFloat(user.store.averageRating) > 0
                            ? `${parseFloat(user.store.averageRating).toFixed(1)} / 5.0`
                            : 'No ratings'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({user.store.ratingCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 italic bg-white/60 p-3 rounded-xl border border-emerald-100">
                    This user does not currently have any store assigned to them.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserDetailsModal;
