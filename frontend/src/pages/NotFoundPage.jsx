import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 bg-amber-50 text-amber-500 rounded-3xl mb-4">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="text-lg font-bold text-slate-700 mt-2">Page Not Found</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
