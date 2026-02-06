'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/lib/mock-data';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('jane.doe@techcorp.com');
  const [password, setPassword] = useState('demo123');
  const [role, setRole] = useState('employee');

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

  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
    
    // Auto-fill email and password based on role
    if (selectedRole === 'super_admin') {
      setEmail('admin@endevo.com');
      setPassword('demo123');
    } else if (selectedRole === 'hr_admin') {
      setEmail('hr@techcorp.com');
      setPassword('demo123');
    } else if (selectedRole === 'employee_zero') {
      setEmail('new.employee@techcorp.com');
      setPassword('demo123');
    } else if (selectedRole === 'employee_progress') {
      setEmail('bob.wilson@techcorp.com');
      setPassword('demo123');
    } else {
      setEmail('jane.doe@techcorp.com');
      setPassword('demo123');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
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
            <p className="mt-2 text-lg text-gray-700">Employee Legacy Readiness Platform</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-sm text-gray-600 mb-6">
              Sign in to access your dashboard
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>

              {/* Role Dropdown */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Demo Account
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <optgroup label="Employees">
                    <option value="employee">Jane Doe - 75% Complete</option>
                    <option value="employee_progress">Bob Wilson - 45% Complete</option>
                    <option value="employee_zero">Alex Johnson - New User (0%)</option>
                  </optgroup>
                  <optgroup label="Admin Roles">
                    <option value="hr_admin">HR Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </optgroup>
                </select>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--endevo-deep-space)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--endevo-deep-space-tint-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--endevo-deep-space)';
                }}
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                This is a demo environment with mock data for UI demonstration purposes
              </p>
            </div>
          </div>

          {/* Available Demo Users */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Demo Accounts</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between py-1">
                <span className="font-medium">new.employee@techcorp.com</span>
                <span className="text-green-600 font-medium">New User (0%)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-medium">bob.wilson@techcorp.com</span>
                <span className="text-blue-600 font-medium">Some Progress (45%)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-medium">jane.doe@techcorp.com</span>
                <span className="text-purple-600 font-medium">Advanced (75%)</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex items-center justify-between py-1">
                <span className="font-medium">hr@techcorp.com</span>
                <span className="text-gray-400">HR Admin</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-medium">admin@endevo.com</span>
                <span className="text-gray-400">Super Admin</span>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">Password for all: demo123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
