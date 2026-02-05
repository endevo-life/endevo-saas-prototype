'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockModules, mockProgress, mockEmployees } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Get employee data
  const employee = mockEmployees.find(e => e.id === user?.id);
  const employeeProgress = mockProgress.filter(p => p.employeeId === user?.id);

  // Calculate statistics
  const completedModules = employeeProgress.filter(p => p.status === 'completed').length;
  const inProgressModules = employeeProgress.filter(p => p.status === 'in_progress');
  const totalModules = mockModules.length;
  const overallProgress = employee?.progressPercentage || 0;

  // Get next module to start
  const nextModule = mockModules.find(
    m => !employeeProgress.find(p => p.moduleId === m.id)
  );

  // Get current in-progress module
  const currentModule = inProgressModules.length > 0
    ? mockModules.find(m => m.id === inProgressModules[0].moduleId)
    : null;

  // Recent activity (last 3 completed modules)
  const recentActivity = employeeProgress
    .filter(p => p.status === 'completed')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 3);

  return (
    <DashboardLayout title="Employee Dashboard" role="employee">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-blue-100 mb-6">
          Your legacy readiness journey - Taking control of what matters most
        </p>
        
        {/* Progress Bar */}
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Overall Progress</span>
            <span className="font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-100 mt-2">
            {completedModules} of {totalModules} modules completed
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedModules}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{inProgressModules.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              🔄
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Assessment Score</p>
              <p className="text-3xl font-bold text-purple-600">
                {employee?.assessmentScore || 'N/A'}
                {employee?.assessmentScore && <span className="text-lg text-gray-500">/10</span>}
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning Card */}
          {currentModule && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">📚 Continue Learning</h2>
                <button
                  onClick={() => router.push(`/employee/modules/${currentModule.id}`)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Continue →
                </button>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl shrink-0">
                  {currentModule.moduleOrder}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentModule.title}</h3>
                  <p className="text-gray-600 mb-3">{currentModule.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Your Progress</span>
                      <span className="text-sm font-medium text-blue-600">
                        {inProgressModules[0].progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${inProgressModules[0].progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    ⏱️ {currentModule.estimatedHours} hours • Last accessed {new Date(inProgressModules[0].lastAccessedAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Start Next Module Card */}
          {nextModule && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">🎯 Ready to Start?</h2>
                <button
                  onClick={() => router.push(`/employee/modules/${nextModule.id}`)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Start Now →
                </button>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center text-3xl shrink-0">
                  📖
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{nextModule.title}</h3>
                  <p className="text-gray-600 mb-3">{nextModule.description}</p>
                  <p className="text-sm text-gray-500">
                    ⏱️ Estimated time: {nextModule.estimatedHours} hours
                    {nextModule.isRequired && <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">Required</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🕐 Recent Activity</h2>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((progress) => {
                  const module = mockModules.find(m => m.id === progress.moduleId);
                  return (
                    <div key={`${progress.employeeId}-${progress.moduleId}`} className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl shrink-0">
                        ✅
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{module?.title}</h4>
                        <p className="text-sm text-gray-600">
                          Completed on {new Date(progress.completedAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/employee/modules/${module?.id}`)}
                        className="px-4 py-2 bg-white hover:bg-gray-50 text-green-700 border border-green-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-3">🚀</p>
                <p>No completed modules yet. Start your first module to build your legacy readiness!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/employee/learning')}
                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-left font-medium transition-colors flex items-center"
              >
                <span className="mr-3 text-xl">📚</span>
                <span>All Learning Modules</span>
              </button>
              
              <button
                onClick={() => router.push('/employee/progress')}
                className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-left font-medium transition-colors flex items-center"
              >
                <span className="mr-3 text-xl">📊</span>
                <span>View Full Progress</span>
              </button>
              
              <button
                onClick={() => router.push('/employee/certificates')}
                className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-left font-medium transition-colors flex items-center"
              >
                <span className="mr-3 text-xl">🏆</span>
                <span>My Certificates</span>
              </button>
              
              {!employee?.assessmentScore && (
                <button
                  onClick={() => router.push('/employee/assessment')}
                  className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-left font-medium transition-colors flex items-center"
                >
                  <span className="mr-3 text-xl">📝</span>
                  <span>Take Assessment</span>
                </button>
              )}
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🔔 Reminders</h2>
            <div className="space-y-3">
              {inProgressModules.length === 0 && completedModules < totalModules && (
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">Start Your Journey</p>
                  <p className="text-xs text-gray-600">Begin your first module to secure your legacy</p>
                </div>
              )}
              
              {inProgressModules.length > 0 && (
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">Complete In Progress</p>
                  <p className="text-xs text-gray-600">You have {inProgressModules.length} module(s) waiting</p>
                </div>
              )}
              
              {overallProgress >= 100 && (
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">🎉 Congratulations!</p>
                  <p className="text-xs text-gray-600">All modules completed. Review anytime!</p>
                </div>
              )}

              {overallProgress < 100 && (
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">Keep Going!</p>
                  <p className="text-xs text-gray-600">{totalModules - completedModules} modules remaining</p>
                </div>
              )}
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">❓ Need Help?</h2>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-blue-600 hover:text-blue-700 hover:underline">
                📖 User Guide
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-700 hover:underline">
                💬 Contact Support
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-700 hover:underline">
                🎥 Video Tutorials
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
      