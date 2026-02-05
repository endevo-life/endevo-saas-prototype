'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function NotFound() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user) {
      // Redirect based on role
      if (user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'hr_admin') {
        router.push('/hr/dashboard');
      } else if (user.role === 'employee') {
        router.push('/employee/dashboard');
      }
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ 
      background: 'linear-gradient(135deg, var(--endevo-deep-space-tint-4) 0%, var(--endevo-open-seas-tint-4) 50%, var(--endevo-guiding-light-tint-4) 100%)'
    }}>
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/asset/logo-complete-large.png" 
            alt="ENDevo Logo" 
            width={180} 
            height={60}
            className="h-16 w-auto"
            priority
          />
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center space-x-4">
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl"
              style={{ backgroundColor: 'var(--endevo-deep-space)' }}
            >
              4
            </div>
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl animate-pulse"
              style={{ backgroundColor: 'var(--endevo-setting-sun)' }}
            >
              0
            </div>
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl"
              style={{ backgroundColor: 'var(--endevo-open-seas)' }}
            >
              4
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--endevo-deep-space)' }}>
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="px-8 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              style={{ backgroundColor: 'var(--endevo-deep-space)' }}
            >
              {user ? '🏠 Back to Dashboard' : '🏠 Go to Home'}
            </button>
            
            <button
              onClick={() => router.back()}
              className="px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all border-2"
              style={{ 
                borderColor: 'var(--endevo-open-seas)',
                color: 'var(--endevo-open-seas)'
              }}
            >
              ← Go Back
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              If you believe this is an error, please contact support or try one of these:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {user && (
                <>
                  {user.role === 'employee' && (
                    <>
                      <button
                        onClick={() => router.push('/employee/dashboard')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        📊 Dashboard
                      </button>
                      <button
                        onClick={() => router.push('/employee/progress')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        📈 Progress
                      </button>
                    </>
                  )}
                  {user.role === 'hr_admin' && (
                    <>
                      <button
                        onClick={() => router.push('/hr/dashboard')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        📊 HR Dashboard
                      </button>
                    </>
                  )}
                  {user.role === 'super_admin' && (
                    <>
                      <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        📊 Admin Dashboard
                      </button>
                    </>
                  )}
                </>
              )}
              {!user && (
                <button
                  onClick={() => router.push('/')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  🔐 Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-600">
          Need assistance? Contact our support team or use the AI assistant in your dashboard.
        </p>
      </div>
    </div>
  );
}
