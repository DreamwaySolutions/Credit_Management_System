import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import {
  loginApi,
  fetchAdminsApi,
  createAdminApi,
  updateAdminApi,
  updateProfileApi
} from '../api/client';

export interface AdminAccount {
  id: number;
  username: string;
  password?: string;
  name: string;
  status: 'active' | 'deactivated';
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  admins: AdminAccount[];
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addAdmin: (username: string, password: string) => Promise<void>;
  updateAdmin: (id: number, username: string, password?: string, status?: 'active' | 'deactivated') => Promise<void>;
  updateProfile: (name: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  refreshAdmins: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  admins: [],
  login: async () => ({ success: false }),
  logout: () => {},
  addAdmin: async () => {},
  updateAdmin: async () => {},
  updateProfile: async () => ({ success: false }),
  refreshAdmins: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('dreamway_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    return null;
  });

  const [admins, setAdmins] = useState<AdminAccount[]>([]);

  // Function to load admins from database
  const refreshAdmins = async () => {
    try {
      const data = await fetchAdminsApi();
      if (Array.isArray(data) && data.length > 0) {
        setAdmins(data);
      }
    } catch (err) {
      console.error('Failed to load admins from database:', err);
    }
  };

  // Load admins when logged in user is superadmin
  useEffect(() => {
    if (user?.role === 'superadmin') {
      refreshAdmins();
    }
  }, [user]);

  // Database-backed login
  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const u = username.trim().toLowerCase();
    const p = password.trim();

    if (!u || !p) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    try {
      const res = await loginApi(u, p);
      if (res && res.token && res.user) {
        localStorage.setItem('dreamway_token', res.token);
        localStorage.setItem('dreamway_user', JSON.stringify(res.user));
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server.' };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Invalid username or password.';
      
      // Offline fallback if server is unreachable
      if (err.code === 'ERR_NETWORK' || !err.response) {
        if (u === 'superadmin' && p === 'admin123') {
          const fallbackUser: User = { id: 999, username: 'superadmin', name: 'Super Admin', role: 'superadmin' };
          setUser(fallbackUser);
          localStorage.setItem('dreamway_user', JSON.stringify(fallbackUser));
          return { success: true };
        }
        if (u === 'satish' && p === 'satish123') {
          const fallbackUser: User = { id: 1, username: 'satish', name: 'Satish Sir', role: 'admin' };
          setUser(fallbackUser);
          localStorage.setItem('dreamway_user', JSON.stringify(fallbackUser));
          return { success: true };
        }
      }

      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dreamway_user');
    localStorage.removeItem('dreamway_token');
  };

  // Create admin directly in database
  const addAdmin = async (username: string, password: string) => {
    try {
      await createAdminApi(username.trim(), password.trim());
      await refreshAdmins();
    } catch (err) {
      console.error('Failed to create admin in database:', err);
    }
  };

  // Update admin directly in database
  const updateAdmin = async (id: number, username: string, password?: string, status: 'active' | 'deactivated' = 'active') => {
    try {
      await updateAdminApi(id, username.trim(), password?.trim() || undefined, status);
      await refreshAdmins();
      if (user && user.id === id) {
        const updatedUser: User = { ...user, username: username.trim() };
        setUser(updatedUser);
        localStorage.setItem('dreamway_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to update admin in database:', err);
    }
  };

  // Update profile in database
  const updateProfile = async (name: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'User is not logged in.' };
    const formattedName = name.trim();
    if (!formattedName) return { success: false, message: 'Name cannot be empty.' };

    try {
      const res = await updateProfileApi(user.id, formattedName, password);
      if (res && res.success) {
        const updatedUser: User = { ...user, name: formattedName };
        setUser(updatedUser);
        localStorage.setItem('dreamway_user', JSON.stringify(updatedUser));
        return { success: true, message: 'Profile updated successfully!' };
      }
      return { success: false, message: res?.message || 'Failed to update profile.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.error || 'Failed to update profile in database.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, admins, login, logout, addAdmin, updateAdmin, updateProfile, refreshAdmins }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

