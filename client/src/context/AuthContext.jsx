import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authRegister,
  authLogin,
  authLogout,
  authGetCurrentUser,
  authUpdateUser,
} from '../services/mockStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(() => {
    const current = authGetCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    if (!email || !password) throw new Error('Email and password required');
    const u = authLogin(email, password);
    setUser(u);
    return u;
  };

  // Note: register(email, password, name) — order matches Signup.jsx call
  const register = async (email, password, name) => {
    if (!name || !email || !password) throw new Error('All fields required');
    const u = authRegister(name, email, password);
    setUser(u);
    return u;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const saved = authUpdateUser(updatedUser);
    setUser(saved);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
