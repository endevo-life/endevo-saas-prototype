'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { mockOrganizations, Organization } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active' as 'active' | 'suspended' | 'trial',
    subscriptionTier: 'basic' as 'basic' | 'professional' | 'enterprise',
    employeeLimit: 50,
  });

  const handleAddOrg = () => {
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: formData.name,
      slug: formData.slug,
      status: formData.status,
      subscriptionTier: formData.subscriptionTier,
      employeeCount: 0,
      employeeLimit: formData.employeeLimit,
      createdAt: new Date().toISOString(),
    };
    setOrganizations([...organizations, newOrg]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditOrg = () => {
    if (!selectedOrg) return;
    const updatedOrgs = organizations.map((org) =>
      org.id === selectedOrg.id
        ? {
            ...org,
            name: formData.name,
            slug: formData.slug,
            status: formData.status,
            subscriptionTier: formData.subscriptionTier,
            employeeLimit: formData.employeeLimit,
          }
        : org
    );
    setOrganizations(updatedOrgs);
    setShowEditModal(false);
    setSelectedOrg(null);
    resetForm();
  };

  const handleDeleteOrg = (id: string) => {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      setOrganizations(organizations.filter((org) => org.id !== id));
    }
  };

  const handleToggleStatus = (org: Organization) => {
    const newStatus = org.status === 'active' ? 'suspended' : 'active';
    const updatedOrgs = organizations.map((o) =>
      o.id === org.id ? { ...o, status: newStatus as 'active' | 'suspended' | 'trial' } : o
    );
    setOrganizations(updatedOrgs);
  };

  const openEditModal = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      status: org.status,
      subscriptionTier: org.subscriptionTier,
      employeeLimit: org.employeeLimit,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      status: 'active',
      subscriptionTier: 'basic',
      employeeLimit: 50,
    });
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    const matchesTier = tierFilter === 'all' || org.subscriptionTier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  return (
    <DashboardLayout title="Organization Management" role="super_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
            <p className="text-gray-600">Manage all organizations on the platform</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            + Add Organization
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orgs</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>
                  {organizations.length}
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
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-open-seas)' }}>
                  {organizations.filter(o => o.status === 'active').length}
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
                <p className="text-sm text-gray-600">Enterprise</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-guiding-light-shade-1)' }}>
                  {organizations.filter(o => o.subscriptionTier === 'enterprise').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-guiding-light-tint-4)' }}>
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-setting-sun)' }}>
                  {organizations.reduce((sum, org) => sum + org.employeeCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </select>
            <select 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrgs.map(org => {
            const usagePercentage = Math.round((org.employeeCount / org.employeeLimit) * 100);
            
            return (
              <div 
                key={org.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{org.name}</h3>
                    <p className="text-sm text-gray-600">{org.slug}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      org.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : org.status === 'trial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {org.status}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {org.subscriptionTier}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-medium text-gray-900">{org.employeeCount} / {org.employeeLimit}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Usage</span>
                      <span className="font-medium text-gray-700">{usagePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${usagePercentage}%`,
                          backgroundColor: usagePercentage > 90 ? 'var(--endevo-setting-sun)' : 'var(--endevo-open-seas)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-900">{new Date(org.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => router.push(`/admin/organizations/${org.id}`)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all hover:shadow-md" 
                    style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}
                  >
                    View
                  </button>
                  <button 
                    onClick={() => openEditModal(org)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:shadow-md" 
                    style={{ backgroundColor: 'var(--endevo-open-seas)' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(org)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:shadow-md ${
                      org.status === 'active' ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                  >
                    {org.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDeleteOrg(org.id)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white transition-all hover:shadow-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Organization Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Add New Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Acme Corporation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., acme"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
                <select
                  value={formData.subscriptionTier}
                  onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic (Up to 50 employees)</option>
                  <option value="professional">Professional (Up to 250 employees)</option>
                  <option value="enterprise">Enterprise (Unlimited)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Limit</label>
                <input
                  type="number"
                  value={formData.employeeLimit}
                  onChange={(e) => setFormData({ ...formData, employeeLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button onClick={handleAddOrg} variant="primary" fullWidth>
                Add Organization
              </Button>
              <Button onClick={() => { setShowAddModal(false); resetForm(); }} variant="outline" fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Edit Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
                <select
                  value={formData.subscriptionTier}
                  onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic (Up to 50 employees)</option>
                  <option value="professional">Professional (Up to 250 employees)</option>
                  <option value="enterprise">Enterprise (Unlimited)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Limit</label>
                <input
                  type="number"
                  value={formData.employeeLimit}
                  onChange={(e) => setFormData({ ...formData, employeeLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button onClick={handleEditOrg} variant="primary" fullWidth>
                Save Changes
              </Button>
              <Button onClick={() => { setShowEditModal(false); setSelectedOrg(null); resetForm(); }} variant="outline" fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
