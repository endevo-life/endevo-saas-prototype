'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockModules, mockProgress, mockEmployees } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function EmployeeLearningPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const employee = mockEmployees.find(e => e.id === user.id);
  const userProgress = mockProgress.find(p => p.employeeId === user.id);
  const enrolledModuleIds = userProgress?.completedModules || [];
  const inProgressModuleIds = userProgress?.currentModules || [];

  const allModuleIds = [...new Set([...enrolledModuleIds, ...inProgressModuleIds])];
  const myLearningModules = mockModules.filter(m => allModuleIds.includes(m.id));

  const categories = [...new Set(myLearningModules.map(m => m.category))];

  return (
    <DashboardLayout title="My Learning" role="employee">
      <div className="space-y-6">
        {/* Initial Assessment Section */}
        {!employee?.assessmentScore ? (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">📝 Start Your Journey</h2>
                <p className="text-white/90 mb-4">
                  Complete your initial assessment to get personalized learning modules with videos and resources.
                </p>
                <button
                  onClick={() => router.push('/employee/assessment')}
                  className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Take Initial Assessment →
                </button>
              </div>
              <div className="text-6xl ml-6">🎯</div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">✅ Assessment Completed</h2>
                <p className="text-white/90">
                  Your personalized learning path has been created based on your assessment results.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{employee.assessmentScore}/10</div>
                <p className="text-sm text-white/80">Your Score</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enrolled</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>
                  {allModuleIds.length}
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
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-setting-sun)' }}>
                  {inProgressModuleIds.length}
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
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-open-seas)' }}>
                  {enrolledModuleIds.length}
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
                <p className="text-sm text-gray-600">Hours Spent</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-guiding-light-shade-1)' }}>
                  {allModuleIds.length * 2.5}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-guiding-light-tint-4)' }}>
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Categories */}
        {categories.map(category => {
          const categoryModules = myLearningModules.filter(m => m.category === category);
          
          return (
            <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{category}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryModules.map(module => {
                  const isCompleted = enrolledModuleIds.includes(module.id);
                  const isInProgress = inProgressModuleIds.includes(module.id);
                  
                  return (
                    <div 
                      key={module.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/employee/modules/${module.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{module.title}</h3>
                        {isCompleted && <span className="text-2xl">✅</span>}
                        {isInProgress && !isCompleted && <span className="text-2xl">📖</span>}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>⏱️ {module.estimatedTime}</span>
                        <span>📚 {module.lessonsCount} lessons</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: isCompleted ? '100%' : isInProgress ? '50%' : '0%',
                              backgroundColor: isCompleted ? 'var(--endevo-open-seas)' : 'var(--endevo-setting-sun)'
                            }}
                          />
                        </div>
                      </div>
                      
                      <button 
                        className="w-full mt-4 px-4 py-2 rounded-lg font-medium text-sm transition-all"
                        style={{
                          backgroundColor: isCompleted ? 'var(--endevo-open-seas)' : 'var(--brand-primary)',
                          color: 'white'
                        }}
                      >
                        {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start Learning'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
