'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout title="Platform Settings" role="super_admin">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Platform Configuration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
              <input
                type="text"
                defaultValue="ENDevo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
              <input
                type="email"
                defaultValue="support@endevo.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Organizations</label>
                <input
                  type="number"
                  defaultValue="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Employees per Org</label>
                <input
                  type="number"
                  defaultValue="500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Feature Flags</h2>
          
          <div className="space-y-4">
            {[
              { label: 'AI Assistant (Jesse)', desc: 'Enable AI-powered help assistant' },
              { label: 'Advanced Analytics', desc: 'Show detailed analytics and reporting' },
              { label: 'Custom Branding', desc: 'Allow organizations to customize colors and logos' },
              { label: 'Multi-language Support', desc: 'Enable platform internationalization' },
              { label: 'Email Notifications', desc: 'Send automated email notifications' },
              { label: 'Video Playback', desc: 'Enable video content in modules' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{feature.label}</p>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Module Management */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Module Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Module Duration (hours)</label>
              <input
                type="number"
                defaultValue="2.5"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lessons per Module</label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Completion Threshold (%)</label>
              <input
                type="number"
                defaultValue="80"
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Subscription Tiers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription Tiers</h2>
          
          <div className="space-y-4">
            {[
              { tier: 'Basic', price: '$99/month', employees: '10', features: 'Core modules' },
              { tier: 'Professional', price: '$299/month', employees: '50', features: 'All modules + Analytics' },
              { tier: 'Enterprise', price: '$999/month', employees: '500', features: 'Everything + Custom branding' },
            ].map((plan) => (
              <div key={plan.tier} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{plan.tier}</h3>
                  <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>{plan.price}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Max Employees:</span>
                    <span className="ml-2 font-medium text-gray-900">{plan.employees}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Features:</span>
                    <span className="ml-2 font-medium text-gray-900">{plan.features}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Maintenance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Maintenance</h2>
          
          <div className="space-y-3">
            <button className="w-full px-4 py-3 rounded-lg font-medium border-2 transition-all hover:shadow-md text-left" style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}>
              <div className="flex items-center justify-between">
                <span>🗄️ Export All Data</span>
                <span className="text-sm">→</span>
              </div>
            </button>
            
            <button className="w-full px-4 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-700 transition-all hover:shadow-md text-left">
              <div className="flex items-center justify-between">
                <span>📊 Generate System Report</span>
                <span className="text-sm">→</span>
              </div>
            </button>
            
            <button className="w-full px-4 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-700 transition-all hover:shadow-md text-left">
              <div className="flex items-center justify-between">
                <span>🔄 Clear Cache</span>
                <span className="text-sm">→</span>
              </div>
            </button>
            
            <button className="w-full px-4 py-3 rounded-lg font-medium border-2 border-red-300 text-red-700 transition-all hover:shadow-md text-left">
              <div className="flex items-center justify-between">
                <span>⚠️ Maintenance Mode</span>
                <span className="text-sm">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-8 py-3 rounded-lg font-medium text-white transition-all hover:shadow-md" style={{ backgroundColor: 'var(--brand-primary)' }}>
            Save All Settings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
