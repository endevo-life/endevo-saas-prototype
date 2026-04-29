'use client';

import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { mockUsers, mockOrganizations, User } from '@/lib/mock-data';
import { useToast } from '@/components/common/Toast';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'org_member', organizationId: 'org-1' });

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchOrg = orgFilter === 'all' || u.organizationId === orgFilter;
      return matchSearch && matchRole && matchOrg;
    });
  }, [users, search, roleFilter, orgFilter]);

  const getOrgName = (id?: string) =>
    id ? mockOrganizations.find((o) => o.id === id)?.name ?? '—' : 'Endevo Platform';

  const openAdd = () => {
    setEditingUser(null);
    setForm({ firstName: '', lastName: '', email: '', role: 'org_member', organizationId: 'org-1' });
    setShowAddModal(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      organizationId: u.organizationId ?? 'org-1',
    });
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.email.trim()) {
      toast('First name and email are required', 'warn');
      return;
    }
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...form, role: form.role as User['role'], organizationId: form.role === 'super_admin' ? undefined : form.organizationId }
            : u
        )
      );
      toast(`${form.firstName} ${form.lastName} updated`, 'success');
    } else {
      const newUser: User = {
        id: `u-${Date.now()}`,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role as User['role'],
        organizationId: form.role === 'super_admin' ? undefined : form.organizationId,
      };
      setUsers([...users, newUser]);
      toast(`${form.firstName} ${form.lastName} added`, 'success');
    }
    setShowAddModal(false);
    setEditingUser(null);
  };

  const handleDelete = (u: User) => {
    if (confirm(`Remove ${u.firstName} ${u.lastName}?`)) {
      setUsers(users.filter((x) => x.id !== u.id));
      toast(`${u.firstName} ${u.lastName} removed`, 'warn');
    }
  };

  return (
    <DashboardLayout title="Platform Users" role="super_admin">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Identity
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mt-1">
            People across all tenants
          </h2>
        </div>
        <button onClick={openAdd} className="lr-btn-primary">
          + Add user
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Stat label="Total" value={String(users.length)} accent />
        <Stat label="Members" value={String(users.filter((u) => u.role === 'org_member').length)} />
        <Stat label="Org Admins" value={String(users.filter((u) => u.role === 'org_admin').length)} />
        <Stat label="Super Admins" value={String(users.filter((u) => u.role === 'super_admin').length)} />
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
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-64 rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold)"
          style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
          style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
        >
          <option value="all" style={{ background: 'var(--lr-navy-deep)' }}>All roles</option>
          <option value="super_admin" style={{ background: 'var(--lr-navy-deep)' }}>Super Admin</option>
          <option value="org_admin" style={{ background: 'var(--lr-navy-deep)' }}>Org Admin</option>
          <option value="org_member" style={{ background: 'var(--lr-navy-deep)' }}>Member</option>
        </select>
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
          style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
        >
          <option value="all" style={{ background: 'var(--lr-navy-deep)' }}>All organizations</option>
          {mockOrganizations.map((org) => (
            <option key={org.id} value={org.id} style={{ background: 'var(--lr-navy-deep)' }}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-[14px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(212,190,148,0.04)' }}>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Organization</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-(family-name:--font-jura) text-sm tracking-wider"
                      style={{
                        background: 'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-midnight) 100%)',
                        color: 'var(--lr-gold)',
                        border: '1px solid var(--lr-gold)',
                      }}
                    >
                      {u.firstName[0]}
                      {u.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm text-(--lr-pearl)">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-[0.7rem] text-(--lr-lavender-dust)">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RolePill role={u.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-(--lr-pearl)">{getOrgName(u.organizationId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => openEdit(u)}
                    className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-gold) hover:text-(--lr-gold-pale) mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase hover:text-(--lr-gold-pale)"
                    style={{ color: '#A65454' }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-(--lr-lavender-dust)">
                  No users match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-[14px] p-7 max-w-md w-full"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-gold)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              Identity
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-5">
              {editingUser ? 'Edit user' : 'Add user'}
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="First name">
                  <ModalInput value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
                </ModalField>
                <ModalField label="Last name">
                  <ModalInput value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
                </ModalField>
              </div>
              <ModalField label="Email">
                <ModalInput value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              </ModalField>
              <ModalField label="Role">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                  style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
                >
                  <option value="org_member" style={{ background: 'var(--lr-navy-deep)' }}>Member</option>
                  <option value="org_admin" style={{ background: 'var(--lr-navy-deep)' }}>Org Admin</option>
                  <option value="super_admin" style={{ background: 'var(--lr-navy-deep)' }}>Super Admin</option>
                </select>
              </ModalField>
              {form.role !== 'super_admin' && (
                <ModalField label="Organization">
                  <select
                    value={form.organizationId}
                    onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                    className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                    style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
                  >
                    {mockOrganizations.map((o) => (
                      <option key={o.id} value={o.id} style={{ background: 'var(--lr-navy-deep)' }}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </ModalField>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} className="lr-btn-primary flex-1">
                {editingUser ? 'Save changes' : 'Add user'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="lr-btn-outline"
                style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}
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

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-6 py-3 ${align === 'right' ? 'text-right' : 'text-left'} font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase`}
      style={{ color: 'var(--lr-gold-soft)' }}
    >
      {children}
    </th>
  );
}

function RolePill({ role }: { role: User['role'] }) {
  const label = role === 'super_admin' ? 'Super Admin' : role === 'org_admin' ? 'Org Admin' : 'Member';
  return (
    <span
      className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
      style={{
        color: role === 'org_member' ? 'var(--lr-pearl)' : 'var(--lr-gold)',
        border: `1px solid ${role === 'org_member' ? 'var(--border-subtle)' : 'var(--border-gold)'}`,
        background: role === 'org_member' ? 'rgba(212,190,148,0.04)' : 'rgba(212,190,148,0.12)',
      }}
    >
      {label}
    </span>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="lr-eyebrow block mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ModalInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
      style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
    />
  );
}
