import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('praxis_token');
    const storedUser = localStorage.getItem('praxis_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('praxis_token');
        localStorage.removeItem('praxis_user');
      }
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    localStorage.setItem('praxis_token', data.token);
    localStorage.setItem('praxis_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem('praxis_token');
    localStorage.removeItem('praxis_user');
    setUser(null);
  }

  async function refreshUser() {
    const { data } = await axiosInstance.get('/auth/me');
    localStorage.setItem('praxis_user', JSON.stringify(data));
    setUser(data);
    return data;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
