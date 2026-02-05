'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/lib/mock-data';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { user, login, switchUser } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'hr_admin') {
        router.push('/hr/dashboard');
      } else if (user.role === 'employee') {
        router.push('/employee/dashboard');
      }
    }
  }, [user, router]);

  const handleQuickLogin = (email: string) => {
    login(email);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-orange-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image 
                src="/asset/logo-complete-xlarge.png" 
                alt="ENDevo Logo" 
                width={200} 
                height={80}
                className="h-20 w-auto"
                priority
              />
            </div>
            <p className="mt-2 text-lg" style={{ color: 'var(--endevo-deep-space-tint-2)' }}>Employee Legacy Readiness Platform</p>
          </div>

          {/* Demo Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Demo Login</h2>
            <p className="text-sm text-gray-600 mb-6">
              Select a user role to explore the platform
            </p>

            <div className="space-y-3">
              {/* Super Admin */}
              <button
                onClick={() => handleQuickLogin('admin@endevo.com')}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 transition-all group"
                style={{ 
                  borderColor: 'var(--endevo-deep-space-tint-4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--endevo-setting-sun)';
                  e.currentTarget.style.backgroundColor = 'var(--endevo-setting-sun-tint-2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--endevo-deep-space-tint-4)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      ENDevo Super Admin
                    </div>
                    <div className="text-sm text-gray-500">Platform administrator</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-deep-space-tint-4)' }}>
                    <span style={{ color: 'var(--endevo-deep-space)' }} className="text-xl">👑</span>
                  </div>
                </div>
              </button>

              {/* HR Admin */}
              <button
                onClick={() => handleQuickLogin('hr@techcorp.com')}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 transition-all group"
                style={{ 
                  borderColor: 'var(--endevo-deep-space-tint-4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--endevo-open-seas)';
                  e.currentTarget.style.backgroundColor = '#F0FDFC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--endevo-deep-space-tint-4)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      HR Admin - TechCorp
                    </div>
                    <div className="text-sm text-gray-500">Organization administrator</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-open-seas)', opacity: 0.2 }}>
                    <span style={{ color: 'var(--endevo-open-seas)' }} className="text-xl">💼</span>
                  </div>
                </div>
              </button>

              {/* Employee */}
              <button
                onClick={() => handleQuickLogin('jane.doe@techcorp.com')}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 transition-all group"
                style={{ 
                  borderColor: 'var(--endevo-deep-space-tint-4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--endevo-guiding-light)';
                  e.currentTarget.style.backgroundColor = '#FEFCE8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--endevo-deep-space-tint-4)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Employee - Jane Doe
                    </div>
                    <div className="text-sm text-gray-500">TechCorp employee</div>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">👤</span>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                This is a demo environment with mock data for UI demonstration purposes
              </p>
            </div>
          </div>

          {/* Brand Colors Info */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--endevo-deep-space)' }}>
              🎨 ENDevo Brand Colors
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--endevo-deep-space)' }}></div>
                <span className="text-gray-600">Deep Space</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--endevo-setting-sun)' }}></div>
                <span className="text-gray-600">Setting Sun</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--endevo-open-seas)' }}></div>
                <span className="text-gray-600">Open Seas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--endevo-guiding-light)' }}></div>
                <span className="text-gray-600">Guiding Light</span>
              </div>
            </div>
          </div>

          {/* Available Demo Users */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Access</h3>
            <div className="space-y-2 text-xs text-gray-600">
              {mockUsers.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between">
                  <span>{u.email}</span>
                  <button
                    onClick={() => switchUser(u.id)}
                    className="px-3 py-1 rounded font-medium transition-colors"
                    style={{ 
                      color: 'var(--endevo-setting-sun)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--endevo-setting-sun-tint-2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Login
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
