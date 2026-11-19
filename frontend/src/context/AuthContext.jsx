import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync current user profile on load if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data.user) {
          const freshUser = response.data.data.user;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      } catch (err) {
        console.error('Failed to sync user profile:', err);
        // If token failed, clear state
        if (err.response?.status === 401) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { user: loggedInUser, token: authToken } = response.data.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      return loggedInUser;
    }
    throw new Error(response.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      const { user: registeredUser, token: authToken } = response.data.data;
      setUser(registeredUser);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      return registeredUser;
    }
    throw new Error(response.data.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
