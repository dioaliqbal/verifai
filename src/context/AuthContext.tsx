import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserNotificationPreferences } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileName: (displayName: string) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserNotificationPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'verifai_auth_user';

const DEFAULT_PREFERENCES: UserNotificationPreferences = {
  emailScanResults: true,
  emailProductUpdates: false,
  securityAlerts: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local session
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser({
          ...parsed,
          preferences: parsed.preferences || DEFAULT_PREFERENCES,
        });
      } else {
        // Pre-authenticate as default demo user for instant accessibility
        const defaultUser: UserProfile = {
          id: 'usr_demo_101',
          email: 'pengguna@diodetector.id',
          displayName: 'Teman DIO',
          photoURL: '',
          preferences: DEFAULT_PREFERENCES,
        };
        setUser(defaultUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    // Validation
    if (!email || !email.includes('@')) {
      throw new Error('Alamat email tidak valid');
    }
    if (!pass || pass.length < 6) {
      throw new Error('Kata sandi harus minimal 6 karakter');
    }

    const nameFromEmail = email.split('@')[0];
    const loggedUser: UserProfile = {
      id: 'usr_' + Math.abs(hashString(email)),
      email,
      displayName: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
      preferences: DEFAULT_PREFERENCES,
    };

    setUser(loggedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedUser));
  };

  const register = async (email: string, pass: string, name?: string) => {
    if (!email || !email.includes('@')) {
      throw new Error('Alamat email tidak valid');
    }
    if (!pass || pass.length < 6) {
      throw new Error('Kata sandi harus minimal 6 karakter');
    }

    const displayName = name?.trim() || email.split('@')[0];
    const registeredUser: UserProfile = {
      id: 'usr_' + Date.now(),
      email,
      displayName,
      preferences: DEFAULT_PREFERENCES,
    };

    setUser(registeredUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(registeredUser));
  };

  const loginWithGoogle = async () => {
    const googleUser: UserProfile = {
      id: 'usr_google_882',
      email: 'user.google@gmail.com',
      displayName: 'Google User',
      preferences: DEFAULT_PREFERENCES,
    };
    setUser(googleUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(googleUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const updateProfileName = async (displayName: string) => {
    if (!user) return;
    const trimmed = displayName.trim();
    if (!trimmed) throw new Error('Nama tidak boleh kosong');
    const updated = { ...user, displayName: trimmed };
    setUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    if (!currentPass) {
      throw new Error('Kata sandi saat ini wajib diisi');
    }
    if (!newPass || newPass.length < 6) {
      throw new Error('Kata sandi baru harus minimal 6 karakter');
    }
    if (currentPass === newPass) {
      throw new Error('Kata sandi baru tidak boleh sama dengan kata sandi saat ini');
    }
    // Simulation success
  };

  const updatePreferences = async (prefs: Partial<UserNotificationPreferences>) => {
    if (!user) return;
    const updated = {
      ...user,
      preferences: {
        ...(user.preferences || DEFAULT_PREFERENCES),
        ...prefs,
      },
    };
    setUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
  };

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfileName,
        changePassword,
        updatePreferences,
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
