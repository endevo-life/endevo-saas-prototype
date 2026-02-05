'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees, mockProgress, mockModules } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';

export default function HRReportsPage() {
  const { user } = useAuth();

  if (!user) return null;

  const orgEmployees = mockEmployees.filter(e => e.organizationId === user.organizationId);

  const getOrgStats = () => {
    const totalModules = mockModules.length;
    const completedCount = mockProgress.reduce((acc, p) => acc + p.completedModules.length, 0);
    const avgCompletion = Math.round((completedCount / (orgEmployees.length * totalModules)) * 100);
    
    return {
      totalEmployees: orgEmployees.length,
      avgCompletion,
      totalCompletions: completedCount,
      totalHours: completedCount * 2.5,
    };
  };

  const stats = getOrgStats();

  const handleExportReport = () => {
    const reportText = `
═══════════════════════════════════════════════════
            ORGANIZATION PROGRESS REPORT
═══════════════════════════════════════════════════

Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

OVERVIEW:
- Total Employees: ${stats.totalEmployees}
- Average Completion: ${stats.avgCompletion}%
- Total Module Completions: ${stats.totalCompletions}
- Total Learning Hours: ${stats.totalHours}

EMPLOYEE DETAILS:
${orgEmployees.map(emp => {
  const progress = mockProgress.find(p => p.employeeId === emp.id);
  const completed = progress?.completedModules.length || 0;
  const percentage = Math.round((completed / mockModules.length) * 100);
  return `
  ${emp.firstName} ${emp.lastName} (${emp.department})
  - Email: ${emp.email}
  - Completed: ${completed}/${mockModules.length} modules (${percentage}%)
  - Status: ${emp.status}`;
}).join('\n')}

═══════════════════════════════════════════════════
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Organization_Progress_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Progress Reports" role="hr_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Organization Analytics</h2>
            <p className="text-gray-600">Track employee learning progress and completion rates</p>
          </div>
          <button
            onClick={handleExportReport}
            className="px-6 py-2 rounded-lg font-medium text-white transition-all hover:shadow-md"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            📥 Export Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>
                  {stats.totalEmployees}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-tint-4)' }}>
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-setting-sun)' }}>
                  {stats.avgCompletion}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Completions</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-open-seas)' }}>
                  {stats.totalCompletions}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-open-seas-tint-4)' }}>
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Learning Hours</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-guiding-light-shade-1)' }}>
                  {stats.totalHours}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-guiding-light-tint-4)' }}>
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module Completion Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Completion Breakdown</h3>
          <div className="space-y-4">
            {mockModules.map(module => {
              const completions = mockProgress.filter(p => p.completedModules.includes(module.id)).length;
              const percentage = Math.round((completions / orgEmployees.length) * 100);
              
              return (
                <div key={module.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{module.title}</span>
                    <span className="text-sm text-gray-600">{completions}/{orgEmployees.length} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: 'var(--endevo-open-seas)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress by Department</h3>
          <div className="space-y-4">
            {[...new Set(orgEmployees.map(e => e.department))].map(dept => {
              const deptEmployees = orgEmployees.filter(e => e.department === dept);
              const deptProgress = deptEmployees.map(emp => {
                const progress = mockProgress.find(p => p.employeeId === emp.id);
                return progress?.completedModules.length || 0;
              });
              const avgProgress = Math.round((deptProgress.reduce((a, b) => a + b, 0) / (deptEmployees.length * mockModules.length)) * 100);
              
              return (
                <div key={dept} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{dept}</span>
                      <span className="text-sm text-gray-600">{deptEmployees.length} employees • {avgProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${avgProgress}%`,
                          backgroundColor: 'var(--brand-primary)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performers</h3>
          <div className="space-y-3">
            {orgEmployees
              .map(emp => ({
                ...emp,
                completed: mockProgress.find(p => p.employeeId === emp.id)?.completedModules.length || 0
              }))
              .sort((a, b) => b.completed - a.completed)
              .slice(0, 5)
              .map((emp, index) => (
                <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                      <p className="text-sm text-gray-600">{emp.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: 'var(--endevo-open-seas)' }}>
                      {emp.completed}/{mockModules.length}
                    </p>
                    <p className="text-xs text-gray-500">modules completed</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
