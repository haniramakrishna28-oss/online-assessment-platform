import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user_data');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await api.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('user_data', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session verification failed, resetting auth:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/login/', { username, password });
      const { access, refresh, user: userData } = res.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(userData));

      setToken(access);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      console.error('Login error:', err);
      let message = 'Invalid username or password.';
      if (err.response) {
        message = err.response.data?.detail || 
                  err.response.data?.non_field_errors?.[0] || 
                  'Invalid username or password.';
      } else {
        message = 'Cannot connect to the backend server. Please verify your backend service is running and VITE_API_BASE_URL is set correctly.';
      }
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/register/', userData);
      setLoading(false);
      return { success: true, message: res.data.message };
    } catch (err) {
      setLoading(false);
      let errorMsg = 'Registration failed. Please check the entered data.';
      if (err.response?.data) {
        const errors = err.response.data;
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
          errorMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
        }
      }
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  const role = user?.role || null;
  const isAdmin = user?.role === 'ADMIN' || user?.is_staff || false;
  const isStudent = user?.role === 'STUDENT';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAdmin,
        isStudent,
        isAuthenticated,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
