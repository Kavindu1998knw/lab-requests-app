import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lab_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('lab_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('lab_user', JSON.stringify(res.user));
          } else {
            // Token expired or invalid
            setUser(null);
            localStorage.removeItem('lab_token');
            localStorage.removeItem('lab_user');
          }
        } catch {
          // Keep cached user if offline
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      if (res.token) {
        localStorage.setItem('lab_token', res.token);
      }
      localStorage.setItem('lab_user', JSON.stringify(res.user));
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password });
      setUser(res.user);
      if (res.token) {
        localStorage.setItem('lab_token', res.token);
      }
      localStorage.setItem('lab_user', JSON.stringify(res.user));
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lab_token');
    localStorage.removeItem('lab_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
