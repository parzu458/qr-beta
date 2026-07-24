import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qr_tracker_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Session expired:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('qr_tracker_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (email, password, name) => {
    const res = await api.register({ email, password, name });
    localStorage.setItem('qr_tracker_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const loginAsDemo = async () => {
    return login('demo@example.com', 'password123');
  };

  const logout = () => {
    localStorage.removeItem('qr_tracker_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
