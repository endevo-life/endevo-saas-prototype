'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { mockOrganizations } from '@/lib/mock-data';

interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  logoUrl?: string;
  organizationName: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Get organization-specific branding
  const organization = mockOrganizations.find(org => org.id === user?.organizationId);
  
  // Default theme (ENDevo branding)
  const defaultTheme: ThemeContextType = {
    colors: {
      primary: '#2563EB',
      primaryHover: '#3B82F6',
      primaryLight: '#EFF6FF',
    },
    organizationName: 'ENDevo',
  };

  // Organization-specific theme (white-label)
  const theme: ThemeContextType = organization?.primaryColor
    ? {
        colors: {
          primary: organization.primaryColor,
          primaryHover: adjustColor(organization.primaryColor, 20),
          primaryLight: adjustColor(organization.primaryColor, 90),
        },
        logoUrl: organization.logoUrl || undefined,
        organizationName: organization.name,
      }
    : defaultTheme;

  return (
    <ThemeContext.Provider value={theme}>
      <style jsx global>{`
        :root {
          --color-brand-primary: ${theme.colors.primary};
          --color-brand-primary-hover: ${theme.colors.primaryHover};
          --color-brand-primary-light: ${theme.colors.primaryLight};
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to adjust color brightness
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
