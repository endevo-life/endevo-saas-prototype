'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { mockEmployees, mockProgress, mockModules } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function HRAnalyticsPage() {
  const { user } = useAuth();
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  if (!user) return null;

  const orgEmployees = mockEmployees.filter(e => e.organizationId === user.organizationId);

  // Completion Rate Data (Pie Chart)
  const completionData = [
    { name: 'Completed', value: orgEmployees.filter(e => e.progressPercentage === 100).length, color: '#10b981' },
    { name: 'In Progress', value: orgEmployees.filter(e => e.progressPercentage > 0 && e.progressPercentage < 100).length, color: '#f59e0b' },
    { name: 'Not Started', value: orgEmployees.filter(e => e.progressPercentage === 0).length, color: '#ef4444' },
  ];

  // Department Progress Data (Bar Chart)
  const departments = [...new Set(orgEmployees.map(e => e.department))];
  const departmentData = departments.map(dept => {
    const deptEmployees = orgEmployees.filter(e => e.department === dept);
    const avgProgress = deptEmployees.reduce((acc, emp) => acc + emp.progressPercentage, 0) / deptEmployees.length;
    return {
      department: dept,
      progress: Math.round(avgProgress),
      employees: deptEmployees.length,
    };
  });

  // Module Completion Data (Bar Chart)
  const moduleCompletionData = mockModules.map(module => {
    const completedCount = mockProgress.filter(
      p => p.moduleId === module.id && p.status === 'completed'
    ).length;
    return {
      module: module.title.substring(0, 20),
      completed: completedCount,
      total: orgEmployees.length,
      rate: Math.round((completedCount / orgEmployees.length) * 100),
    };
  });

  // Assessment Score Distribution (Bar Chart)
  const assessmentDistribution = [
    { range: '0-3', count: orgEmployees.filter(e => e.assessmentScore !== null && e.assessmentScore <= 3).length },
    { range: '4-6', count: orgEmployees.filter(e => e.assessmentScore !== null && e.assessmentScore >= 4 && e.assessmentScore <= 6).length },
    { range: '7-10', count: orgEmployees.filter(e => e.assessmentScore !== null && e.assessmentScore >= 7).length },
    { range: 'Not Taken', count: orgEmployees.filter(e => e.assessmentScore === null).length },
  ];

  // Engagement Trend (Line Chart) - Mock weekly data
  const weeklyEngagementData = [
    { week: 'Week 1', active: 12, completed: 3 },
    { week: 'Week 2', active: 18, completed: 5 },
    { week: 'Week 3', active: 15, completed: 8 },
    { week: 'Week 4', active: 22, completed: 12 },
  ];

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Handle chart click
  const handleChartClick = (chartName: string) => {
    setSelectedChart(selectedChart === chartName ? null : chartName);
  };

  // Generate report
  const handleGenerateReport = (type: 'weekly' | 'monthly' | 'yearly') => {
    const report = `
ENDevo HR Analytics Report - ${type.toUpperCase()}
Generated: ${new Date().toLocaleString()}
Organization: ${user.organizationId}

═══════════════════════════════════════════
EMPLOYEE SUMMARY
═══════════════════════════════════════════
Total Employees: ${orgEmployees.length}
Active: ${orgEmployees.filter(e => e.status === 'active').length}
Average Progress: ${Math.round(orgEmployees.reduce((acc, e) => acc + e.progressPercentage, 0) / orgEmployees.length)}%

═══════════════════════════════════════════
COMPLETION METRICS
═══════════════════════════════════════════
Completed: ${completionData[0].value} employees
In Progress: ${completionData[1].value} employees
Not Started: ${completionData[2].value} employees

═══════════════════════════════════════════
DEPARTMENT BREAKDOWN
═══════════════════════════════════════════
${departmentData.map(d => `${d.department}: ${d.progress}% avg progress (${d.employees} employees)`).join('\n')}

═══════════════════════════════════════════
MODULE COMPLETION RATES
═══════════════════════════════════════════
${moduleCompletionData.map(m => `${m.module}: ${m.rate}% (${m.completed}/${m.total})`).join('\n')}

═══════════════════════════════════════════
ASSESSMENT SCORES
═══════════════════════════════════════════
High (7-10): ${assessmentDistribution[2].count} employees
Medium (4-6): ${assessmentDistribution[1].count} employees
Low (0-3): ${assessmentDistribution[0].count} employees
Not Taken: ${assessmentDistribution[3].count} employees
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ENDevo-HR-Report-${type}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="HR Analytics" role="hr_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            <p className="text-gray-600">Visual insights into employee progress and engagement</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleGenerateReport('weekly')} variant="outline" size="sm">
              Weekly Report
            </Button>
            <Button onClick={() => handleGenerateReport('monthly')} variant="outline" size="sm">
              Monthly Report
            </Button>
            <Button onClick={() => handleGenerateReport('yearly')} variant="primary" size="sm">
              Yearly Report
            </Button>
          </div>
        </div>

        {/* Completion Overview - Pie Chart */}
        <Card>
          <div 
            className="cursor-pointer"
            onClick={() => handleChartClick('completion')}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Completion Status Overview
              {selectedChart === 'completion' && <span className="ml-2 text-sm text-blue-600">(Click to collapse)</span>}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name}: ${props.value} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {selectedChart === 'completion' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Insight:</strong> {completionData[0].value} employees ({Math.round((completionData[0].value / orgEmployees.length) * 100)}%) have completed all modules.
                  Focus on supporting the {completionData[2].value} employees who haven't started yet.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Department Progress - Bar Chart */}
        <Card>
          <div 
            className="cursor-pointer"
            onClick={() => handleChartClick('department')}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Progress by Department
              {selectedChart === 'department' && <span className="ml-2 text-sm text-blue-600">(Click to collapse)</span>}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="progress" fill="#3b82f6" name="Avg Progress %" />
                <Bar dataKey="employees" fill="#10b981" name="Employees" />
              </BarChart>
            </ResponsiveContainer>
            {selectedChart === 'department' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Insight:</strong> The {departmentData.sort((a, b) => b.progress - a.progress)[0]?.department} department leads with {departmentData.sort((a, b) => b.progress - a.progress)[0]?.progress}% average progress.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Module Completion Rates */}
        <Card>
          <div 
            className="cursor-pointer"
            onClick={() => handleChartClick('modules')}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Module Completion Rates
              {selectedChart === 'modules' && <span className="ml-2 text-sm text-blue-600">(Click to collapse)</span>}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moduleCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="rate" fill="#f59e0b" name="Completion Rate %" />
              </BarChart>
            </ResponsiveContainer>
            {selectedChart === 'modules' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Insight:</strong> Early modules show higher completion rates. Consider targeted campaigns for later modules.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Assessment Score Distribution */}
        <Card>
          <div 
            className="cursor-pointer"
            onClick={() => handleChartClick('assessment')}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assessment Score Distribution
              {selectedChart === 'assessment' && <span className="ml-2 text-sm text-blue-600">(Click to collapse)</span>}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assessmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Employees" />
              </BarChart>
            </ResponsiveContainer>
            {selectedChart === 'assessment' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Insight:</strong> {assessmentDistribution[3].count} employees haven't completed the assessment yet. 
                  Send reminders to increase participation.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Weekly Engagement Trend */}
        <Card>
          <div 
            className="cursor-pointer"
            onClick={() => handleChartClick('engagement')}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Engagement Trend
              {selectedChart === 'engagement' && <span className="ml-2 text-sm text-blue-600">(Click to collapse)</span>}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyEngagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} name="Active Users" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completions" />
              </LineChart>
            </ResponsiveContainer>
            {selectedChart === 'engagement' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Insight:</strong> Engagement is trending upward! Active users and completion rates are both increasing week over week.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Ask AI for Custom Report */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ask AI for Custom Report</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="e.g., 'Show me employees who haven't logged in for 30 days' or 'Compare Engineering vs Sales progress'"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="primary">
              🤖 Generate Report
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            * AI-powered reports are coming soon. Enter natural language queries to generate custom analytics.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
