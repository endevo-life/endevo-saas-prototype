'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockModules } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';

export default function HRModulesPage() {
  const router = useRouter();

  const categories = [...new Set(mockModules.map(m => m.category))];

  return (
    <DashboardLayout title="Module Management" role="hr_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Modules</h2>
            <p className="text-gray-600">Manage and assign modules to employees</p>
          </div>
          <button className="px-6 py-2 rounded-lg font-medium text-white transition-all hover:shadow-md" style={{ backgroundColor: 'var(--brand-primary)' }}>
            + Create Module
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Modules</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>
                  {mockModules.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-tint-4)' }}>
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-open-seas)' }}>
                  {categories.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-open-seas-tint-4)' }}>
                <span className="text-2xl">🏷️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lessons</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-setting-sun)' }}>
                  {mockModules.reduce((sum, m) => sum + m.lessonsCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
                <span className="text-2xl">📖</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-guiding-light-shade-1)' }}>
                  {mockModules.length * 2.5}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-guiding-light-tint-4)' }}>
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search modules..."
              className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Categories</option>
              {categories.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Sort by: Name</option>
              <option>Sort by: Duration</option>
              <option>Sort by: Lessons</option>
            </select>
          </div>
        </div>

        {/* Modules by Category */}
        {categories.map(category => {
          const categoryModules = mockModules.filter(m => m.category === category);
          
          return (
            <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{category}</h3>
                <span className="text-sm text-gray-600">{categoryModules.length} modules</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryModules.map(module => (
                  <div 
                    key={module.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex-1">{module.title}</h4>
                      <button className="text-gray-400 hover:text-gray-600 ml-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>⏱️ {module.estimatedTime}</span>
                      <span>📚 {module.lessonsCount} lessons</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {module.competency}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/employee/modules/${module.id}`)}
                        className="flex-1 px-4 py-2 rounded-lg font-medium text-sm border-2 transition-all hover:shadow-md"
                        style={{ 
                          borderColor: 'var(--brand-primary)',
                          color: 'var(--brand-primary)'
                        }}
                      >
                        Preview
                      </button>
                      <button 
                        className="flex-1 px-4 py-2 rounded-lg font-medium text-sm text-white transition-all hover:shadow-md"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
