import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { snapnowApi, User, PhotographerProfile } from '../api/snapnowApi';
import { clearSessionCookie } from '../api/client';

interface AuthContextType {
  user: User | null;
  photographerProfile: PhotographerProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, fullName: string, role: 'customer' | 'photographer') => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPhotographerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_FLAG_KEY = 'snapnow_authenticated_v3';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [photographerProfile, setPhotographerProfile] = useState<PhotographerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const refreshPhotographerProfile = async () => {
    setIsProfileLoading(true);
    try {
      const profile = await snapnowApi.mePhotographer();
      setPhotographerProfile(profile);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setUser(null);
        setPhotographerProfile(null);
        await SecureStore.deleteItemAsync(AUTH_FLAG_KEY);
      } else {
        setPhotographerProfile(null);
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await snapnowApi.me();
      if (!currentUser) {
        setUser(null);
        setPhotographerProfile(null);
        await SecureStore.deleteItemAsync(AUTH_FLAG_KEY);
        return;
      }
      setUser(currentUser);
      if (currentUser.role === 'photographer') {
        await refreshPhotographerProfile();
      } else {
        setPhotographerProfile(null);
      }
    } catch {
      setUser(null);
      setPhotographerProfile(null);
      await SecureStore.deleteItemAsync(AUTH_FLAG_KEY);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const wasAuthenticated = await SecureStore.getItemAsync(AUTH_FLAG_KEY);
        if (wasAuthenticated === 'true') {
          try {
            await refreshUser();
          } catch {
            await SecureStore.deleteItemAsync(AUTH_FLAG_KEY);
            setUser(null);
            setPhotographerProfile(null);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const loggedInUser = await snapnowApi.login({ email, password });
    await SecureStore.setItemAsync(AUTH_FLAG_KEY, 'true');
    // Small delay to ensure session cookie is saved by response interceptor
    await new Promise(resolve => setTimeout(resolve, 100));
    setUser(loggedInUser);
    if (loggedInUser.role === 'photographer') {
      await refreshPhotographerProfile();
    }
    return loggedInUser;
  };

  const register = async (email: string, password: string, fullName: string, role: 'customer' | 'photographer'): Promise<User> => {
    const newUser = await snapnowApi.register({ email, password, fullName, role });
    await SecureStore.setItemAsync(AUTH_FLAG_KEY, 'true');
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await snapnowApi.logout();
    } catch {
    }
    await clearSessionCookie();
    await SecureStore.deleteItemAsync(AUTH_FLAG_KEY);
    setUser(null);
    setPhotographerProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        photographerProfile,
        isLoading,
        isProfileLoading,
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
