import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../../utils/validation';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const newErrors = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    const addrErr = validateAddress(formData.address);
    if (addrErr) newErrors.address = addrErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/admin/users', formData);
      if (response.data.success) {
        onUserAdded(response.data.data);
        onClose();
        setFormData({
          name: '',
          email: '',
          password: '',
          address: '',
          role: 'NORMAL_USER',
        });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(err.response?.data?.message || 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
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
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Add New User</h3>
            <p className="text-xs text-slate-500">Create an account for any role</p>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.name.length}/60 (min 20)
              </span>
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe Super Administrator"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              User Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white"
            >
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="SYSTEM_ADMIN">System Administrator</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Address
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.address.length}/400 max
              </span>
            </div>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Full postal address"
              className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.address
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
