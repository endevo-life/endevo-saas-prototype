'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import Image from 'next/image';
import { mockOrganizations } from '@/lib/mock-data';
import ChatWidget from '@/components/ChatWidget';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: 'super_admin' | 'hr_admin' | 'employee';
}

export default function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else if (user.role !== role) {
      // Redirect to appropriate dashboard
      if (user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'hr_admin') {
        router.push('/hr/dashboard');
      } else if (user.role === 'employee') {
        router.push('/employee/dashboard');
      }
    }
  }, [user, role, router]);

  if (!user || user.role !== role) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    switch (role) {
      case 'super_admin':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
          { label: 'Organizations', path: '/admin/organizations', icon: '🏢' },
          { label: 'Users', path: '/admin/users', icon: '👥' },
          { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
          { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
        ];
      case 'hr_admin':
        return [
          { label: 'Dashboard', path: '/hr/dashboard', icon: '📊' },
          { label: 'Employees', path: '/hr/employees', icon: '👥' },
          { label: 'Analytics', path: '/hr/analytics', icon: '📈' },
          { label: 'Progress Reports', path: '/hr/reports', icon: '📋' },
          { label: 'Modules', path: '/hr/modules', icon: '📚' },
          { label: 'Settings', path: '/hr/settings', icon: '⚙️' },
        ];
      case 'employee':
        return [
          { label: 'Dashboard', path: '/employee/dashboard', icon: '🏠' },
          { label: 'Progress Summary', path: '/employee/progress', icon: '📊' },
          { label: 'My Learning', path: '/employee/learning', icon: '📚' },
          { label: 'Certificates', path: '/employee/certificates', icon: '🏆' },
          { label: 'Profile', path: '/employee/profile', icon: '👤' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavigationItems();
  const isActivePath = (path: string) => pathname === path;

  // Get organization name
  const organization = user.organizationId 
    ? mockOrganizations.find(org => org.id === user.organizationId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-30">
        <div className="h-full px-4 flex justify-between items-center">
          {/* Left: Menu Toggle & Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-3">
              <Image 
                src="/asset/logo-complete-xlarge.png" 
                alt="ENDevo Logo" 
                width={140} 
                height={48}
                className="h-10 w-auto"
                priority
              />
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{organization?.name || 'ENDevo Platform'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Left Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <div className={`h-full overflow-y-auto ${sidebarOpen ? 'p-4' : 'hidden'}`}>
          {/* Role Badge */}
          <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-tint-4)' }}>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Current Role</p>
            <p className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
              {role === 'super_admin' ? 'Super Admin' : role === 'hr_admin' ? 'HR Admin' : 'Employee'}
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={isActive ? {
                    backgroundColor: 'var(--brand-primary)',
                  } : {}}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Help Section */}
          <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Need Help?</p>
            <div className="space-y-2">
              <button 
                onClick={() => window.open('/docs', '_blank')}
                className="w-full flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                <span>📚</span>
                <span>Read Documentation</span>
              </button>
              <button 
                onClick={() => setChatOpen(true)}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:shadow-md"
                style={{ 
                  background: 'linear-gradient(135deg, var(--endevo-open-seas) 0%, var(--endevo-deep-space) 100%)'
                }}
              >
                <Image 
                  src="/asset/jesse-image.png" 
                  alt="Jesse AI" 
                  width={28} 
                  height={28}
                  className="w-7 h-7 rounded-full object-cover border-2 border-white"
                />
                <span>Ask Jesse (AI)</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Get guidance on navigation, terms, and best practices
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'pl-64' : 'pl-0'
        }`}
      >
        <div className="p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          
          {children}
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
