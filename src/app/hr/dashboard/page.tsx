'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees, mockOrganizations, mockModules, mockProgress } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HRDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Get organization data
  const organization = mockOrganizations.find(o => o.id === user?.organizationId);
  const orgEmployees = mockEmployees.filter(e => e.organizationId === user?.organizationId && e.role === 'employee');

  // Calculate stats
  const totalEmployees = orgEmployees.length;
  const enrolledEmployees = orgEmployees.filter(e => e.onboardedAt).length;
  const enrollmentPercentage = Math.round((enrolledEmployees / totalEmployees) * 100);
  
  const completedEmployees = orgEmployees.filter(e => e.progressPercentage === 100).length;
  const completionPercentage = Math.round((completedEmployees / totalEmployees) * 100);
  
  // Calculate avg time spent per employee
  const totalTimeSpent = orgEmployees.reduce((sum, emp) => {
    const empProgress = mockProgress.filter(p => p.employeeId === emp.id);
    // Estimate 30 minutes per completed module
    return sum + (empProgress.length * 0.5);
  }, 0);
  const avgHoursPerEmployee = (totalTimeSpent / totalEmployees).toFixed(1);

  // Mock engagement trends data (last 4 weeks)
  const weeklyEngagement = [8, 12, 15, 18];
  
  // Mock demographics breakdown
  const demographics = [
    { ageGroup: '25-35', engagement: 45, count: 5 },
    { ageGroup: '36-50', engagement: 72, count: 8 },
    { ageGroup: '51+', engagement: 83, count: 6 }
  ];

  return (
    <DashboardLayout title="ENDevo Dashboard" role="hr_admin">
      {/* Privacy Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🔒</span>
          <div>
            <p className="text-sm text-gray-700">
              <strong>Privacy-first design:</strong> You see aggregated metrics only, never individual content.{' '}
              <a href="/privacy-hr" className="text-blue-600 hover:underline">
                Learn more about our privacy commitment
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ENDevo Dashboard</h1>
            <p className="text-gray-600 mt-1">{organization?.name}</p>
          </div>
          <button
            onClick={() => alert('Downloading report...')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Download Report ▼
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-blue-600 mb-2">{enrollmentPercentage}%</p>
            <p className="text-lg font-semibold text-gray-900">Enrollment</p>
            <p className="text-sm text-gray-600 mt-1">
              {enrolledEmployees} of {totalEmployees} employees
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-green-600 mb-2">{completionPercentage}%</p>
            <p className="text-lg font-semibold text-gray-900">Completed</p>
            <p className="text-sm text-gray-600 mt-1">{completedEmployees} employees</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-orange-600 mb-2">{avgHoursPerEmployee} hrs</p>
            <p className="text-lg font-semibold text-gray-900">Avg Time</p>
            <p className="text-sm text-gray-600 mt-1">per employee</p>
          </div>
        </div>
      </div>

      {/* Engagement Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Engagement Trends (Last 30 Days)</h2>
        <div className="flex items-end space-x-4 h-64">
          {weeklyEngagement.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                <div
                  className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                  style={{ height: `${(value / 20) * 100}%` }}
                  title={`${value} employees active`}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-600 mt-3">Week {index + 1}</p>
              <p className="text-xs text-gray-500">{value} active</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demographics Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Demographics Breakdown</h2>
        <div className="space-y-6">
          {demographics.map((demo) => (
            <div key={demo.ageGroup}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Age {demo.ageGroup}:</span>
                <span className="text-sm font-semibold text-gray-900">{demo.engagement}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${demo.engagement}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{demo.count} employees</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => router.push('/hr/employees')}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 text-left transition-colors shadow-md"
        >
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-bold text-xl mb-2">View Employee Roster</h3>
          <p className="text-sm text-blue-100">See detailed progress and metrics</p>
        </button>

        <button
          onClick={() => setShowReminderModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-6 text-left transition-colors shadow-md"
        >
          <div className="text-4xl mb-3">📧</div>
          <h3 className="font-bold text-xl mb-2">Send Reminder</h3>
          <p className="text-sm text-orange-100">Encourage employees to continue learning</p>
        </button>

        <button
          onClick={() => alert('Scheduling report...')}
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 text-left transition-colors shadow-md"
        >
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-bold text-xl mb-2">Schedule Report</h3>
          <p className="text-sm text-green-100">Set up automated analytics delivery</p>
        </button>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Send Reminder</h3>
            <p className="text-gray-600 mb-6">
              Send a friendly reminder to employees who haven't completed their learning path.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Template
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                defaultValue="Hi there! We noticed you haven't completed your ENDevo learning path yet. Taking just a few minutes each day can make a big difference. Your privacy is always protected - your progress is yours alone."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  alert('Reminders sent successfully!');
                  setShowReminderModal(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Send Reminders
              </button>
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
