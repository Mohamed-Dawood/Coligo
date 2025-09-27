import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/apiService';
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeParseJSON,
} from '../utils/localStorage';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  studentId?: string;
  department?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = safeGetItem('token');
    const storedUserString = safeGetItem('user');

    if (storedToken && storedUserString) {
      const parsedUser = safeParseJSON<User>(storedUserString);
      if (parsedUser) {
        setToken(storedToken);
        setUser(parsedUser);
        apiService.setAuthToken(storedToken);
      } else {
        // Clear invalid data
        safeRemoveItem('token');
        safeRemoveItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email?: string, password?: string) => {
    try {
      setIsLoading(true);
      console.log('Starting login process...');

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const loginData = { email, password };

      console.log('Login data:', loginData);
      const response = await apiService.login(loginData);
      console.log('API response:', response);

      const { user: userData, token: authToken } = response.data.data;
      console.log('User data:', userData);
      console.log('Token:', authToken);

      if (!userData || !authToken) {
        throw new Error('Invalid response data');
      }

      setUser(userData);
      setToken(authToken);

      safeSetItem('token', authToken);
      safeSetItem('user', JSON.stringify(userData));

      apiService.setAuthToken(authToken);
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    safeRemoveItem('token');
    safeRemoveItem('user');
    apiService.setAuthToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
