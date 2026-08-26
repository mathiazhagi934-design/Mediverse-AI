import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
    if (tokens?.access) {
      api.get('/accounts/user/')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('tokens');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/accounts/login/', { username, password });
    localStorage.setItem('tokens', JSON.stringify(res.data));
    const userRes = await api.get('/accounts/user/');
    setUser(userRes.data);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/accounts/register/', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('tokens');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
