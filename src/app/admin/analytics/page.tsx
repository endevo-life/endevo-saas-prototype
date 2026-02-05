'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockOrganizations, mockEmployees, mockProgress, mockModules } from '@/lib/mock-data';

export default function AdminAnalyticsPage() {
  const platformStats = {
    totalOrgs: mockOrganizations.length,
    totalEmployees: mockEmployees.length,
    totalCompletions: mockProgress.reduce((sum, p) => sum + p.completedModules.length, 0),
    avgCompletion: Math.round((mockProgress.reduce((sum, p) => sum + p.completedModules.length, 0) / (mockEmployees.length * mockModules.length)) * 100),
  };

  return (
    <DashboardLayout title="Platform Analytics" role="super_admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
          <p className="text-gray-600">Real-time analytics across all organizations</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Organizations</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>
                  {platformStats.totalOrgs}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-tint-4)' }}>
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-open-seas)' }}>
                  {platformStats.totalEmployees}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-open-seas-tint-4)' }}>
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Module Completions</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-setting-sun)' }}>
                  {platformStats.totalCompletions}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-guiding-light-shade-1)' }}>
                  {platformStats.avgCompletion}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-guiding-light-tint-4)' }}>
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Performance</h3>
          <div className="space-y-4">
            {mockOrganizations.map(org => {
              const orgEmployees = mockEmployees.filter(e => e.organizationId === org.id);
              const orgProgress = mockProgress.filter(p => orgEmployees.some(e => e.id === p.employeeId));
              const completions = orgProgress.reduce((sum, p) => sum + p.completedModules.length, 0);
              const avgCompletion = orgEmployees.length > 0 
                ? Math.round((completions / (orgEmployees.length * mockModules.length)) * 100)
                : 0;
              
              return (
                <div key={org.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{org.name}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">{orgEmployees.length} employees</span>
                        <span className="font-medium" style={{ color: 'var(--brand-primary)' }}>{avgCompletion}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${avgCompletion}%`,
                          backgroundColor: 'var(--endevo-open-seas)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module Popularity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Completed Modules</h3>
            <div className="space-y-3">
              {mockModules
                .map(module => ({
                  ...module,
                  completions: mockProgress.filter(p => p.completedModules.includes(module.id)).length
                }))
                .sort((a, b) => b.completions - a.completions)
                .slice(0, 5)
                .map((module, index) => (
                  <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{module.title}</p>
                        <p className="text-xs text-gray-600">{module.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: 'var(--endevo-open-seas)' }}>
                        {module.completions}
                      </p>
                      <p className="text-xs text-gray-500">completions</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
            <div className="space-y-4">
              {['basic', 'professional', 'enterprise'].map(tier => {
                const count = mockOrganizations.filter(o => o.subscriptionTier === tier).length;
                const percentage = Math.round((count / mockOrganizations.length) * 100);
                
                return (
                  <div key={tier}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">{tier}</span>
                      <span className="text-sm text-gray-600">{count} orgs ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: tier === 'enterprise' 
                            ? 'var(--endevo-guiding-light-shade-1)' 
                            : tier === 'professional'
                            ? 'var(--brand-primary)'
                            : 'var(--endevo-open-seas)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Status Breakdown</h4>
              <div className="space-y-2">
                {['active', 'trial', 'suspended'].map(status => {
                  const count = mockOrganizations.filter(o => o.status === status).length;
                  
                  return (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 capitalize">{status}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : status === 'trial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { type: 'completion', user: 'Jane Doe', action: 'completed "Estate Planning Basics"', time: '2 hours ago' },
              { type: 'enrollment', user: 'John Smith', action: 'enrolled in "Digital Assets Management"', time: '4 hours ago' },
              { type: 'org', user: 'TechCorp', action: 'upgraded to Professional tier', time: '1 day ago' },
              { type: 'completion', user: 'Bob Wilson', action: 'completed "Healthcare Directives"', time: '1 day ago' },
              { type: 'user', user: 'Alice Johnson', action: 'joined InnovateCo', time: '2 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'completion' ? 'bg-green-100' :
                  activity.type === 'enrollment' ? 'bg-blue-100' :
                  activity.type === 'org' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <span className="text-xl">
                    {activity.type === 'completion' ? '✅' :
                     activity.type === 'enrollment' ? '📚' :
                     activity.type === 'org' ? '🏢' : '👤'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
