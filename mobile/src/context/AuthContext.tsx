import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { snapnowApi, User, PhotographerProfile } from '../api/snapnowApi';

interface AuthContextType {
  user: User | null;
  photographerProfile: PhotographerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, fullName: string, role: 'customer' | 'photographer') => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPhotographerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [photographerProfile, setPhotographerProfile] = useState<PhotographerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await snapnowApi.me();
      setUser(currentUser);
      if (currentUser?.role === 'photographer') {
        await refreshPhotographerProfile();
      }
    } catch {
      setUser(null);
      setPhotographerProfile(null);
    }
  };

  const refreshPhotographerProfile = async () => {
    try {
      const profile = await snapnowApi.mePhotographer();
      setPhotographerProfile(profile);
    } catch {
      setPhotographerProfile(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const loggedInUser = await snapnowApi.login({ email, password });
    setUser(loggedInUser);
    if (loggedInUser.role === 'photographer') {
      await refreshPhotographerProfile();
    }
    return loggedInUser;
  };

  const register = async (email: string, password: string, fullName: string, role: 'customer' | 'photographer'): Promise<User> => {
    const newUser = await snapnowApi.register({ email, password, fullName, role });
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await snapnowApi.logout();
    setUser(null);
    setPhotographerProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        photographerProfile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        refreshPhotographerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
