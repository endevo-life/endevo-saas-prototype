'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockModules, mockProgress, mockEmployees } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProgressSummaryPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Get employee data
  const employee = mockEmployees.find(e => e.id === user?.id);
  const employeeProgress = mockProgress.filter(p => p.employeeId === user?.id);

  const completedModules = employeeProgress.filter(p => p.status === 'completed');
  const inProgressModules = employeeProgress.filter(p => p.status === 'in_progress');
  const notStartedModules = mockModules.filter(
    m => !employeeProgress.find(p => p.moduleId === m.id)
  );

  const totalHoursInvested = completedModules.reduce((sum, progress) => {
    const module = mockModules.find(m => m.id === progress.moduleId);
    return sum + (module?.estimatedHours || 0);
  }, 0);

  const handleExportPDF = () => {
    const content = `
═══════════════════════════════════════════════════════════
          ENDevo Legacy Readiness Progress Report
═══════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}

EMPLOYEE INFORMATION
─────────────────────────────────────────────────────────
Name:           ${user?.firstName} ${user?.lastName}
Email:          ${user?.email}
Assessment:     ${employee?.assessmentScore ? `${employee.assessmentScore}/10` : 'Not completed'}

OVERALL PROGRESS
─────────────────────────────────────────────────────────
Completion:     ${employee?.progressPercentage || 0}%
Completed:      ${completedModules.length} modules
In Progress:    ${inProgressModules.length} modules
Not Started:    ${notStartedModules.length} modules
Time Invested:  ${totalHoursInvested.toFixed(1)} hours

═══════════════════════════════════════════════════════════
                    COMPLETED MODULES
═══════════════════════════════════════════════════════════

${completedModules.length > 0 ? completedModules
  .map((progress, index) => {
    const module = mockModules.find(m => m.id === progress.moduleId);
    return `
${index + 1}. ${module?.title}
   Completed: ${new Date(progress.completedAt || '').toLocaleDateString()}
   Duration: ${module?.estimatedHours} hours
   ✓ COMPLETED`;
  })
  .join('\n') : 'No modules completed yet.'}

═══════════════════════════════════════════════════════════
                  MODULES IN PROGRESS
═══════════════════════════════════════════════════════════

${inProgressModules.length > 0 ? inProgressModules
  .map((progress, index) => {
    const module = mockModules.find(m => m.id === progress.moduleId);
    return `
${index + 1}. ${module?.title}
   Progress: ${progress.progressPercentage}%
   Last Accessed: ${new Date(progress.lastAccessedAt || '').toLocaleDateString()}
   Estimated Time: ${module?.estimatedHours} hours`;
  })
  .join('\n') : 'No modules in progress.'}

═══════════════════════════════════════════════════════════
                    UPCOMING MODULES
═══════════════════════════════════════════════════════════

${notStartedModules.length > 0 ? notStartedModules
  .map((module, index) => `
${index + 1}. ${module.title}
   Description: ${module.description}
   Duration: ${module.estimatedHours} hours
   ${module.isRequired ? '⚠ REQUIRED' : '○ Optional'}`)
  .join('\n') : 'All modules have been started!'}

═══════════════════════════════════════════════════════════
                    KEY ACHIEVEMENTS
═══════════════════════════════════════════════════════════

${completedModules.length > 0 ? `
✓ Completed ${completedModules.length} learning modules
✓ Invested ${totalHoursInvested.toFixed(1)} hours in legacy planning
✓ ${employee?.progressPercentage || 0}% progress toward full readiness
${employee?.assessmentScore ? `✓ Peace of Mind Assessment Score: ${employee.assessmentScore}/10` : ''}
` : `
○ Ready to begin your legacy readiness journey
○ Multiple learning paths available
○ Self-paced learning at your convenience
`}

═══════════════════════════════════════════════════════════
                      NEXT STEPS
═══════════════════════════════════════════════════════════

${notStartedModules.length > 0 ? `
1. Continue with: ${notStartedModules[0].title}
2. Review completed modules for reinforcement
3. Share progress with loved ones when ready
` : `
1. Review all completed modules
2. Apply learnings to your personal situation
3. Export your final summary
`}

═══════════════════════════════════════════════════════════

This report is confidential and for your personal use only.
Your learning content and notes are private and secure.

ENDevo Legacy Readiness Platform
Helping you prepare for what matters most.

═══════════════════════════════════════════════════════════
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ENDevo-Complete-Summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout title="Progress Summary" role="employee">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/employee/dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress Summary</h1>
            <p className="text-gray-600">Complete overview of your legacy readiness journey</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center"
            >
              <span className="mr-2">🖨️</span>
              Print
            </button>
            <button
              onClick={handleExportPDF}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">📥</span>
              Export / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {employee?.progressPercentage || 0}%
            </div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {completedModules.length}
            </div>
            <div className="text-sm text-gray-600">Modules Completed</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {totalHoursInvested.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">Time Invested</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {employee?.assessmentScore || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Readiness Score</div>
          </div>
        </div>
      </div>

      {/* Completed Modules */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-3 text-green-600">✅</span>
          Completed Modules ({completedModules.length})
        </h2>
        
        {completedModules.length > 0 ? (
          <div className="space-y-4">
            {completedModules.map(progress => {
              const module = mockModules.find(m => m.id === progress.moduleId);
              return (
                <div
                  key={progress.moduleId}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{module?.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{module?.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>✓ Completed: {new Date(progress.completedAt || '').toLocaleDateString()}</span>
                      <span>⏱️ Duration: {module?.estimatedHours} hours</span>
                    </div>
                  </div>
                  <div className="text-green-600 text-3xl ml-4">✓</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📚</div>
            <p>No modules completed yet. Start your journey today!</p>
          </div>
        )}
      </div>

      {/* In Progress */}
      {inProgressModules.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-3 text-blue-600">🔄</span>
            In Progress ({inProgressModules.length})
          </h2>
          
          <div className="space-y-4">
            {inProgressModules.map(progress => {
              const module = mockModules.find(m => m.id === progress.moduleId);
              return (
                <div
                  key={progress.moduleId}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{module?.title}</h3>
                    <span className="text-sm font-medium text-blue-600">
                      {progress.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress.progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Last accessed: {new Date(progress.lastAccessedAt || '').toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Modules */}
      {notStartedModules.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-3 text-gray-600">📋</span>
            Upcoming Modules ({notStartedModules.length})
          </h2>
          
          <div className="space-y-3">
            {notStartedModules.map(module => (
              <div
                key={module.id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                      <span>⏱️ {module.estimatedHours} hours</span>
                      {module.isRequired && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <span className="text-2xl mr-3">🔒</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Your Privacy is Protected</h3>
            <p className="text-sm text-blue-800">
              This summary is for your personal records only. Your HR administrator can see completion
              status and progress percentages, but they cannot access your learning content, notes, or
              personal reflections. Your privacy is our priority.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
