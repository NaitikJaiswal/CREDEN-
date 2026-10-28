import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { ApiClient } from '../../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  activeRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('creden_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await ApiClient.getCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            ApiClient.clearToken();
            setToken(null);
          }
        } catch {
          ApiClient.clearToken();
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.login({ email, password: pass });
      if (res.success && res.token) {
        ApiClient.setToken(res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.demoLogin(role);
      if (res.success && res.token) {
        ApiClient.setToken(res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } catch {
      // Seamless resilient fallback for demo users when standalone/Vercel deployed
      const mockUsers: Record<string, User> = {
        AICTE_ADMIN: {
          id: 'demo-aicte-1',
          name: 'Dr. Ramesh Sharma',
          email: 'aicte.admin@gov.in',
          roles: ['AICTE_ADMIN'],
        },
        INSTITUTION_ADMIN: {
          id: 'demo-inst-1',
          name: 'Prof. Suresh Patil',
          email: 'registrar@coep.ac.in',
          roles: ['INSTITUTION_ADMIN'],
          institutionId: 'inst-coep-01',
        },
        STUDENT: {
          id: 'demo-stud-1',
          name: 'Aarav Sharma',
          email: 'aarav.sharma@coep.ac.in',
          roles: ['STUDENT'],
        },
        VERIFIER: {
          id: 'demo-verif-1',
          name: 'Priya Nambiar',
          email: 'priya.nambiar@infosys.com',
          roles: ['VERIFIER'],
        },
      };
      const fallbackUser = mockUsers[role] || mockUsers['AICTE_ADMIN'];
      setUser(fallbackUser);
      setToken('demo-token-' + role);
      ApiClient.setToken('demo-token-' + role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await ApiClient.logout();
    } catch {
      // Continue cleanup on failure
    } finally {
      ApiClient.clearToken();
      setToken(null);
      setUser(null);
    }
  };

  const activeRole = user?.roles[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        demoLogin,
        logout,
        isAuthenticated: !!user,
        activeRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

