'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockModules, mockProgress } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeeCertificatesPage() {
  const { user } = useAuth();

  if (!user) return null;

  const userProgress = mockProgress.find(p => p.employeeId === user.id);
  const completedModuleIds = userProgress?.completedModules || [];
  const completedModules = mockModules.filter(m => completedModuleIds.includes(m.id));

  const handleDownloadCertificate = (moduleTitle: string) => {
    const certificateText = `
═══════════════════════════════════════════════════
              CERTIFICATE OF COMPLETION
═══════════════════════════════════════════════════

                    ENDevo Platform
         Employee Legacy Readiness Education

This certifies that

              ${user.firstName} ${user.lastName}

has successfully completed the module:

                  "${moduleTitle}"

Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

═══════════════════════════════════════════════════
    `;

    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ENDevo_Certificate_${moduleTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="My Certificates" role="employee">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Achievements</h2>
              <p className="text-gray-600">
                You've earned {completedModules.length} certificate{completedModules.length !== 1 ? 's' : ''} so far. Keep up the great work!
              </p>
            </div>
            <div className="text-6xl">🏆</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Certificates</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-open-seas)' }}>
                  {completedModules.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-open-seas-tint-4)' }}>
                <span className="text-2xl">📜</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hours Certified</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-guiding-light-shade-1)' }}>
                  {completedModules.length * 2.5}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-guiding-light-tint-4)' }}>
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>
                  {Math.round((completedModules.length / mockModules.length) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-tint-4)' }}>
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {completedModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedModules.map(module => (
              <div 
                key={module.id}
                className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
                    <p className="text-sm text-gray-600">{module.category}</p>
                  </div>
                  <div className="text-4xl ml-4">🏅</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Issued to:</span>
                    <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{module.estimatedTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadCertificate(module.title)}
                  className="w-full px-4 py-2 rounded-lg font-medium text-white transition-all hover:shadow-md"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  📥 Download Certificate
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 mb-6">
              Complete your first module to earn a certificate!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
