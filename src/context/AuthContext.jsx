import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gw_admin_token');
    if (token) {
      api.get('/auth/me')
        .then(r => {
          if (r.data.user.role !== 'admin') { localStorage.removeItem('gw_admin_token'); return; }
          setUser(r.data.user);
        })
        .catch(() => localStorage.removeItem('gw_admin_token'))
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.user.role !== 'admin') throw new Error('Admin access required.');
    localStorage.setItem('gw_admin_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => { localStorage.removeItem('gw_admin_token'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
