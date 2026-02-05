'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, mockUsers, mockOrganizations } from '@/lib/mock-data';
import { applyOrgTheme, applyRoleTheme } from '@/lib/theme';

interface AuthContextType {
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user
    const storedUserId = localStorage.getItem('endevo_user_id');
    if (storedUserId) {
      const foundUser = mockUsers.find(u => u.id === storedUserId);
      if (foundUser) {
        setUser(foundUser);
        applyTheme(foundUser);
      }
    }
  }, []);

  const applyTheme = (user: User) => {
    // Apply role theme
    applyRoleTheme(user.role);

    // Apply organization theme if user has one
    if (user.organizationId) {
      const org = mockOrganizations.find(o => o.id === user.organizationId);
      if (org) {
        applyOrgTheme(org.slug);
      }
    } else if (user.role === 'super_admin') {
      // Super admin gets default ENDevo theme
      applyOrgTheme('endevo');
    }
  };

  const login = (email: string): boolean => {
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('endevo_user_id', foundUser.id);
      applyTheme(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('endevo_user_id');
    // Reset to default theme
    if (typeof document !== 'undefined') {
      document.body.removeAttribute('data-org');
      document.body.removeAttribute('data-role');
    }
  };

  const switchUser = (userId: string) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('endevo_user_id', foundUser.id);
      applyTheme(foundUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchUser }}>
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
