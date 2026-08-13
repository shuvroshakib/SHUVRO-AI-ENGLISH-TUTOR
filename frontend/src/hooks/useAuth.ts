import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from '../utils/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shuvro_token');
    const savedUser = localStorage.getItem('shuvro_user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token
      api.auth.me().then(data => {
        setUser(data.user);
        localStorage.setItem('shuvro_user', JSON.stringify(data.user));
      }).catch(() => {
        logout();
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('shuvro_token', data.token);
    localStorage.setItem('shuvro_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const data = await api.auth.register(email, password, name);
    localStorage.setItem('shuvro_token', data.token);
    localStorage.setItem('shuvro_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('shuvro_token');
    localStorage.removeItem('shuvro_user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
