'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { mockOrganizations } from '@/lib/mock-data';
import ChatWidget from '@/components/ChatWidget';
import LRMonogram from '@/components/common/LRMonogram';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: 'super_admin' | 'org_admin' | 'org_member';
}

type ThemeMode = 'dark' | 'light';

export default function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Hydrate theme from localStorage and apply to body
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('lr_theme')) as ThemeMode | null;
    const mode: ThemeMode = saved === 'light' || saved === 'dark' ? saved : 'dark';
    setTheme(mode);
    document.body.setAttribute('data-theme', mode);
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('lr_theme', next);
  };

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else if (user.role !== role) {
      if (user.role === 'super_admin') router.push('/superadmin/dashboard');
      else if (user.role === 'org_admin') router.push('/org/admin/dashboard');
      else if (user.role === 'org_member') router.push('/org/member/dashboard');
    }
  }, [user, role, router]);

  if (!user || user.role !== role) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getNavigationItems = () => {
    switch (role) {
      case 'super_admin':
        return [
          { label: 'Dashboard', path: '/superadmin/dashboard' },
          { label: 'Organizations', path: '/superadmin/organizations' },
          { label: 'Users', path: '/superadmin/users' },
          { label: 'Analytics', path: '/superadmin/analytics' },
          { label: 'Settings', path: '/superadmin/settings' },
        ];
      case 'org_admin':
        return [
          { label: 'Dashboard', path: '/org/admin/dashboard' },
          { label: 'Members', path: '/org/admin/employees' },
          { label: 'Analytics', path: '/org/admin/analytics' },
          { label: 'Modules', path: '/org/admin/modules' },
          { label: 'Settings', path: '/org/admin/settings' },
        ];
      case 'org_member':
        return [
          { label: 'Today', path: '/org/member/dashboard' },
          { label: 'The Path', path: '/org/member/path' },
          { label: 'Final Playbook', path: '/org/member/certificates' },
          { label: 'Profile', path: '/org/member/profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavigationItems();
  const isActivePath = (path: string) => pathname === path;

  const organization = user.organizationId
    ? mockOrganizations.find((org) => org.id === user.organizationId)
    : null;

  const roleLabel =
    role === 'super_admin' ? 'Super Admin' : role === 'org_admin' ? 'Org Admin' : 'Member';

  return (
    <div className="min-h-screen bg-(--lr-midnight) text-(--lr-pearl)">
      {/* Top Navigation Bar */}
      <nav
        className="fixed top-0 left-0 right-0 h-16 z-30 border-b border-(--border-subtle)"
        style={{ background: 'var(--lr-midnight)' }}
      >
        <div className="h-full px-5 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-(--surface-elevated) transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-(--lr-gold)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-3">
              <LRMonogram size={36} />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-(family-name:--font-italiana) text-(--lr-gold) text-base tracking-[0.14em]">
                  LEGACY READINESS OS
                </span>
                <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.2em] uppercase text-(--lr-lavender-dust)">
                  Powered by Endevo
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="p-2 rounded-lg hover:bg-(--surface-elevated) transition-colors"
            >
              {theme === 'dark' ? (
                /* Sun — click to go light */
                <svg className="w-5 h-5 text-(--lr-gold)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" strokeWidth={1.6} />
                  <path strokeLinecap="round" strokeWidth={1.6} d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4" />
                </svg>
              ) : (
                /* Moon — click to go dark */
                <svg className="w-5 h-5 text-(--lr-gold)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <button className="p-2 rounded-lg hover:bg-(--surface-elevated) transition-colors relative">
              <svg className="w-5 h-5 text-(--lr-pearl)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-(--lr-gold) rounded-full" />
            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-(--border-subtle)">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-(--lr-pearl)">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[0.65rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) font-(family-name:--font-jura)">
                  {organization?.name ?? 'Endevo Platform'}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-(family-name:--font-jura) text-sm tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-navy-deep) 100%)',
                  color: 'var(--lr-gold)',
                  border: '1px solid var(--lr-gold)',
                }}
              >
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-(family-name:--font-jura) tracking-[0.1em] uppercase text-(--lr-lavender-dust) hover:text-(--lr-gold) hover:bg-(--surface-elevated) rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 transition-all duration-300 z-20 border-r border-(--border-subtle) ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}
        style={{ background: 'var(--lr-navy-deep)' }}
      >
        <div className={`h-full overflow-y-auto ${sidebarOpen ? 'p-5' : 'hidden'}`}>
          <div className="mb-6">
            <p className="lr-eyebrow mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
              Current Role
            </p>
            <p className="font-(family-name:--font-italiana) text-xl tracking-[0.06em] text-(--lr-gold)">
              {roleLabel}
            </p>
            <hr className="lr-separator mt-4" />
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-(family-name:--font-jura) tracking-[0.08em] uppercase transition-all ${
                    isActive
                      ? 'bg-(--lr-gold) text-(--lr-navy-deep)'
                      : 'text-(--lr-pearl) hover:bg-(--surface-elevated)'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <hr className="lr-separator my-6" />

          <div className="space-y-2">
            <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
              Need guidance?
            </p>
            <button
              onClick={() => setChatOpen(true)}
              className="w-full text-left px-4 py-3 rounded-lg text-xs font-(family-name:--font-jura) tracking-[0.1em] uppercase transition-all"
              style={{
                background: 'transparent',
                color: 'var(--lr-gold)',
                border: '1px solid var(--lr-gold)',
              }}
            >
              Ask Jesse — AI Guide
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="px-6 lg:px-10 pt-8 pb-12 max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
              {roleLabel}
            </p>
            <h1 className="font-(family-name:--font-italiana) text-3xl tracking-[0.06em] text-(--lr-gold)">
              {title}
            </h1>
            <hr className="lr-separator mt-4 max-w-md" />
          </div>

          {children}
        </div>
      </main>

      <ChatWidget isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
