'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { mockOrganizations, Organization } from '@/lib/mock-data';
import { useToast } from '@/components/common/Toast';

type Status = 'active' | 'suspended' | 'trial';
type Tier = 'basic' | 'professional' | 'enterprise';

export default function AdminOrganizationsPage() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    status: Status;
    subscriptionTier: Tier;
    employeeLimit: number;
  }>({
    name: '',
    slug: '',
    status: 'active',
    subscriptionTier: 'basic',
    employeeLimit: 50,
  });

  const handleAddOrg = () => {
    if (!formData.name.trim()) {
      toast('Organization name is required', 'warn');
      return;
    }
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      status: formData.status,
      subscriptionTier: formData.subscriptionTier,
      employeeCount: 0,
      employeeLimit: formData.employeeLimit,
      createdAt: new Date().toISOString(),
    };
    setOrganizations([...organizations, newOrg]);
    setShowAddModal(false);
    resetForm();
    toast(`${newOrg.name} added`, 'success');
  };

  const handleEditOrg = () => {
    if (!selectedOrg) return;
    setOrganizations(
      organizations.map((org) =>
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
      )
    );
    setShowEditModal(false);
    setSelectedOrg(null);
    resetForm();
    toast(`${formData.name} updated`, 'success');
  };

  const handleDeleteOrg = (org: Organization) => {
    if (confirm(`Delete ${org.name}? This cannot be undone.`)) {
      setOrganizations(organizations.filter((o) => o.id !== org.id));
      toast(`${org.name} removed`, 'warn');
    }
  };

  const handleToggleStatus = (org: Organization) => {
    const newStatus: Status = org.status === 'active' ? 'suspended' : 'active';
    setOrganizations(organizations.map((o) => (o.id === org.id ? { ...o, status: newStatus } : o)));
    toast(`${org.name} ${newStatus === 'active' ? 'activated' : 'suspended'}`, 'info');
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
    setFormData({ name: '', slug: '', status: 'active', subscriptionTier: 'basic', employeeLimit: 50 });
  };

  const filtered = organizations.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchTier = tierFilter === 'all' || o.subscriptionTier === tierFilter;
    return matchSearch && matchStatus && matchTier;
  });

  return (
    <DashboardLayout title="Organizations" role="super_admin">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Tenant management
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mt-1">
            All organizations
          </h2>
        </div>
        <button onClick={() => setShowAddModal(true)} className="lr-btn-primary">
          + Add organization
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Stat label="Total" value={String(organizations.length)} accent />
        <Stat label="Active" value={String(organizations.filter((o) => o.status === 'active').length)} />
        <Stat label="Enterprise" value={String(organizations.filter((o) => o.subscriptionTier === 'enterprise').length)} />
        <Stat label="Members" value={String(organizations.reduce((s, o) => s + o.employeeCount, 0))} />
      </div>

      {/* Filters */}
      <div
        className="rounded-[14px] p-4 mb-6 flex flex-wrap gap-3"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <input
          type="text"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold)"
          style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
        />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={[['all', 'All status'], ['active', 'Active'], ['trial', 'Trial'], ['suspended', 'Suspended']]} />
        <FilterSelect value={tierFilter} onChange={setTierFilter} options={[['all', 'All tiers'], ['basic', 'Basic'], ['professional', 'Professional'], ['enterprise', 'Enterprise']]} />
      </div>

      {/* Org cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((org) => {
          const usage = Math.round((org.employeeCount / org.employeeLimit) * 100);
          return (
            <div
              key={org.id}
              className="rounded-[14px] p-6 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] truncate">
                    {org.name}
                  </h3>
                  <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-gold-soft) mt-1">
                    {org.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusPill status={org.status} />
                  <TierPill tier={org.subscriptionTier} />
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-xs">
                  <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-(--lr-gold-soft)">
                    Members
                  </span>
                  <span className="font-(family-name:--font-jetbrains) text-(--lr-pearl)">
                    {org.employeeCount} / {org.employeeLimit}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[0.65rem] mb-1.5">
                    <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-(--lr-gold-soft)">
                      Capacity
                    </span>
                    <span className="font-(family-name:--font-jetbrains) text-(--lr-gold)">{usage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(212,190,148,0.12)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${usage}%`, background: usage > 90 ? '#A65454' : 'var(--lr-gold)' }} />
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-(--lr-gold-soft)">
                    Created
                  </span>
                  <span className="font-(family-name:--font-jetbrains) text-(--lr-pearl)">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <hr className="lr-separator mb-4" />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toast(`Tenant detail for ${org.name} — coming next`, 'info')}
                  className="lr-btn-outline"
                  style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}
                >
                  View
                </button>
                <button onClick={() => openEditModal(org)} className="lr-btn-outline">
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(org)}
                  className="lr-btn-outline"
                  style={{ color: 'var(--lr-gold-pale)', borderColor: 'var(--lr-gold-pale)' }}
                >
                  {org.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteOrg(org)}
                  className="lr-btn-outline"
                  style={{ color: '#A65454', borderColor: '#A65454' }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="md:col-span-2 text-center py-14">
            <p className="text-(--lr-lavender-dust) text-sm">No organizations match your filter.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <OrgModal
          title="Add organization"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAddOrg}
          onCancel={() => {
            setShowAddModal(false);
            resetForm();
          }}
          submitLabel="Add organization"
        />
      )}

      {showEditModal && (
        <OrgModal
          title="Edit organization"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditOrg}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedOrg(null);
            resetForm();
          }}
          submitLabel="Save changes"
        />
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-[14px] p-5"
      style={{
        background: accent
          ? 'linear-gradient(180deg, rgba(212,190,148,0.16) 0%, rgba(212,190,148,0.06) 100%)'
          : 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
        border: accent ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
      }}
    >
      <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </p>
      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-3xl">{value}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
      style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v} style={{ background: 'var(--lr-navy-deep)' }}>
          {l}
        </option>
      ))}
    </select>
  );
}

function StatusPill({ status }: { status: Status }) {
  const styles =
    status === 'active'
      ? { color: 'var(--lr-gold)', border: 'var(--lr-gold)', bg: 'rgba(212,190,148,0.12)' }
      : status === 'trial'
      ? { color: 'var(--lr-gold-pale)', border: 'var(--lr-gold-pale)', bg: 'rgba(228,215,185,0.12)' }
      : { color: '#A65454', border: '#A65454', bg: 'rgba(166,84,84,0.16)' };
  return (
    <span
      className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
      style={{ color: styles.color, border: `1px solid ${styles.border}`, background: styles.bg }}
    >
      {status}
    </span>
  );
}

function TierPill({ tier }: { tier: Tier }) {
  return (
    <span
      className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
      style={{ color: 'var(--lr-pearl)', border: '1px solid var(--border-subtle)', background: 'rgba(212,190,148,0.04)' }}
    >
      {tier}
    </span>
  );
}

function OrgModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  title: string;
  formData: { name: string; slug: string; status: Status; subscriptionTier: Tier; employeeLimit: number };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; slug: string; status: Status; subscriptionTier: Tier; employeeLimit: number }>>;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-[14px] p-7 max-w-md w-full"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
          Tenant
        </p>
        <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-5">
          {title}
        </h3>

        <div className="space-y-4">
          <Field label="Organization name">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
              placeholder="Acme Corporation"
              className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
            />
          </Field>
          <Field label="Slug">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData((s) => ({ ...s, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              placeholder="acme"
              className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select
                value={formData.status}
                onChange={(e) => setFormData((s) => ({ ...s, status: e.target.value as Status }))}
                className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
              >
                <option value="active" style={{ background: 'var(--lr-navy-deep)' }}>Active</option>
                <option value="trial" style={{ background: 'var(--lr-navy-deep)' }}>Trial</option>
                <option value="suspended" style={{ background: 'var(--lr-navy-deep)' }}>Suspended</option>
              </select>
            </Field>
            <Field label="Tier">
              <select
                value={formData.subscriptionTier}
                onChange={(e) => setFormData((s) => ({ ...s, subscriptionTier: e.target.value as Tier }))}
                className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
              >
                <option value="basic" style={{ background: 'var(--lr-navy-deep)' }}>Basic</option>
                <option value="professional" style={{ background: 'var(--lr-navy-deep)' }}>Professional</option>
                <option value="enterprise" style={{ background: 'var(--lr-navy-deep)' }}>Enterprise</option>
              </select>
            </Field>
          </div>
          <Field label="Member limit">
            <input
              type="number"
              value={formData.employeeLimit}
              onChange={(e) => setFormData((s) => ({ ...s, employeeLimit: parseInt(e.target.value) || 0 }))}
              min="1"
              className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
            />
          </Field>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onSubmit} className="lr-btn-primary flex-1">
            {submitLabel}
          </button>
          <button onClick={onCancel} className="lr-btn-outline" style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="lr-eyebrow block mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
