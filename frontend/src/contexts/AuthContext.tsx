import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  avatar_url?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('sf-token') || sessionStorage.getItem('sf-token');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // Use the me endpoint to validate token and fetch user
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('sf-token');
      sessionStorage.removeItem('sf-token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (token: string, rememberMe: boolean) => {
    // Clear both first to be safe
    localStorage.removeItem('sf-token');
    sessionStorage.removeItem('sf-token');

    if (rememberMe) {
      localStorage.setItem('sf-token', token);
    } else {
      sessionStorage.setItem('sf-token', token);
    }
    
    // Once token is saved, api interceptor will pick it up
    await checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('sf-token');
    sessionStorage.removeItem('sf-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
