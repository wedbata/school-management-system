import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: Role) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('edupulse_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('edupulse_token') || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('edupulse_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('edupulse_token', authToken);
        localStorage.setItem('edupulse_user', JSON.stringify(userData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: Role) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/demo-login', { role });
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('edupulse_token', authToken);
        localStorage.setItem('edupulse_user', JSON.stringify(userData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edupulse_token');
    localStorage.removeItem('edupulse_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        demoLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
