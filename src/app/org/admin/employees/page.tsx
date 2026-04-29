'use client';

import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees, mockProgress, mockModules, Employee } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/common/Toast';

type Status = 'active' | 'inactive';
type Band = 'AT_RISK' | 'STARTING' | 'PREPARED' | 'PROTECTED' | 'LEGACY_READY';

function bandFor(progress: number): { id: Band; label: string } {
  if (progress >= 90) return { id: 'LEGACY_READY', label: 'Legacy Ready' };
  if (progress >= 70) return { id: 'PROTECTED',    label: 'Protected'    };
  if (progress >= 50) return { id: 'PREPARED',     label: 'Prepared'     };
  if (progress >= 25) return { id: 'STARTING',     label: 'Starting'     };
  return                     { id: 'AT_RISK',      label: 'At Risk'      };
}

const BAND_PALETTE: Record<Band, { color: string; border: string; bg: string }> = {
  AT_RISK:      { color: 'var(--lr-lavender-dust)', border: 'var(--lr-lavender-dust)', bg: 'rgba(180,175,195,0.15)' },
  STARTING:     { color: 'var(--lr-gold-pale)',     border: 'var(--lr-gold-pale)',     bg: 'rgba(228,215,185,0.18)' },
  PREPARED:     { color: 'var(--lr-gold-soft)',     border: 'var(--lr-gold-soft)',     bg: 'rgba(195,172,128,0.18)' },
  PROTECTED:    { color: 'var(--lr-gold)',          border: 'var(--lr-gold)',          bg: 'rgba(212,190,148,0.20)' },
  LEGACY_READY: { color: 'var(--lr-gold)',          border: 'var(--lr-gold)',          bg: 'rgba(212,190,148,0.30)' },
};

export default function HREmployeesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    jobTitle: '',
    hireDate: '',
    status: 'active' as Status,
  });

  if (!user) return null;

  const orgEmployees = employees.filter((e) => e.organizationId === user.organizationId);

  const departments = useMemo(() => [...new Set(orgEmployees.map((e) => e.department))], [orgEmployees]);

  const getProgress = (employeeId: string) => {
    const progress = mockProgress.find((p) => p.employeeId === employeeId);
    if (!progress) return { completed: 0, total: mockModules.length, percentage: 0 };
    const completed = progress.completedModules.length;
    const total = mockModules.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const filtered = orgEmployees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const resetForm = () =>
    setForm({ email: '', firstName: '', lastName: '', department: '', jobTitle: '', hireDate: '', status: 'active' });

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setShowAddModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      email: emp.email,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      jobTitle: emp.jobTitle,
      hireDate: emp.hireDate,
      status: emp.status,
    });
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.email.trim()) {
      toast('First name and email are required', 'warn');
      return;
    }
    if (editing) {
      setEmployees(employees.map((e) => (e.id === editing.id ? { ...e, ...form } : e)));
      toast(`${form.firstName} ${form.lastName} updated`, 'success');
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        organizationId: user.organizationId!,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role: 'org_member',
        status: form.status,
        onboardedAt: new Date().toISOString(),
        lastLoginAt: null,
        progressPercentage: 0,
        assessmentScore: null,
        department: form.department,
        jobTitle: form.jobTitle,
        hireDate: form.hireDate,
      };
      setEmployees([...employees, newEmp]);
      toast(`${form.firstName} ${form.lastName} invited`, 'success');
    }
    setShowAddModal(false);
    setEditing(null);
    resetForm();
  };

  const handleRemove = (emp: Employee) => {
    if (confirm(`Remove ${emp.firstName} ${emp.lastName} from this tenant?`)) {
      setEmployees(employees.filter((e) => e.id !== emp.id));
      toast(`${emp.firstName} ${emp.lastName} removed`, 'warn');
    }
  };

  const handleNudge = (emp: Employee) => {
    toast(`Reminder queued for ${emp.firstName} — gentle, brand-voiced`, 'success');
  };

  const avgReadiness = orgEmployees.length > 0
    ? Math.round(orgEmployees.reduce((acc, e) => acc + getProgress(e.id).percentage, 0) / orgEmployees.length)
    : 0;

  return (
    <DashboardLayout title="Members" role="org_admin">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Roster
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.02em] mt-1">
            People in your tenant
          </h2>
          <p className="text-xs text-(--lr-lavender-dust) mt-1.5">
            Names visible only because you administer this tenant. Member content stays private.
          </p>
        </div>
        <button onClick={openAdd} className="lr-btn-primary">
          + Invite member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Stat label="Members" value={String(orgEmployees.length)} accent />
        <Stat label="Active" value={String(orgEmployees.filter((e) => e.status === 'active').length)} />
        <Stat label="Avg readiness" value={`${avgReadiness}%`} />
        <Stat label="Departments" value={String(departments.length)} />
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
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
          style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
        >
          <option value="all" style={{ background: 'var(--lr-navy-deep)' }}>All departments</option>
          {departments.map((d) => (
            <option key={d} value={d} style={{ background: 'var(--lr-navy-deep)' }}>{d}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
          style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
        >
          <option value="all" style={{ background: 'var(--lr-navy-deep)' }}>All status</option>
          <option value="active" style={{ background: 'var(--lr-navy-deep)' }}>Active</option>
          <option value="inactive" style={{ background: 'var(--lr-navy-deep)' }}>Inactive</option>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(212,190,148,0.04)' }}>
                <Th>Member</Th>
                <Th>Department</Th>
                <Th>Readiness</Th>
                <Th>Band</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const progress = getProgress(emp.id);
                const band = bandFor(emp.progressPercentage);
                const pal = BAND_PALETTE[band.id];
                return (
                  <tr key={emp.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderTop: '1px solid var(--border-subtle)' }}>
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
                          {emp.firstName[0]}
                          {emp.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm text-(--lr-pearl)">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[0.7rem] text-(--lr-lavender-dust)">{emp.jobTitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-(--lr-pearl)">{emp.department}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(212,190,148,0.12)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress.percentage}%`, background: pal.color }}
                          />
                        </div>
                        <span className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm w-9 text-right">
                          {progress.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
                        style={{ color: pal.color, border: `1px solid ${pal.border}`, background: pal.bg }}
                      >
                        {band.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
                        style={{
                          color: emp.status === 'active' ? 'var(--lr-gold)' : 'var(--lr-lavender-dust)',
                          border: emp.status === 'active' ? '1px solid var(--lr-gold)' : '1px solid var(--border-subtle)',
                          background: emp.status === 'active' ? 'rgba(212,190,148,0.1)' : 'rgba(212,190,148,0.04)',
                        }}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleNudge(emp)}
                        className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-gold) hover:text-(--lr-gold-pale) mr-4"
                      >
                        Nudge
                      </button>
                      <button
                        onClick={() => openEdit(emp)}
                        className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-pearl) hover:text-(--lr-gold) mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemove(emp)}
                        className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase hover:text-(--lr-gold-pale)"
                        style={{ color: '#A65454' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-(--lr-lavender-dust)">
                    No members match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-[14px] p-7 max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-gold)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              Roster
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.02em] mb-5">
              {editing ? 'Edit member' : 'Invite member'}
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="First name">
                  <ModalInput value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} placeholder="Sarah" />
                </ModalField>
                <ModalField label="Last name">
                  <ModalInput value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} placeholder="Mitchell" />
                </ModalField>
              </div>
              <ModalField label="Email">
                <ModalInput value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="sarah.mitchell@xyzcompany.com" type="email" />
              </ModalField>
              <ModalField label="Department">
                <ModalInput value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="Caregiver Solutions" />
              </ModalField>
              <ModalField label="Job title">
                <ModalInput value={form.jobTitle} onChange={(v) => setForm({ ...form, jobTitle: v })} placeholder="Senior Care Navigator" />
              </ModalField>
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="Hire date">
                  <ModalInput value={form.hireDate} onChange={(v) => setForm({ ...form, hireDate: v })} type="date" />
                </ModalField>
                <ModalField label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                    className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                    style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
                  >
                    <option value="active" style={{ background: 'var(--lr-navy-deep)' }}>Active</option>
                    <option value="inactive" style={{ background: 'var(--lr-navy-deep)' }}>Inactive</option>
                  </select>
                </ModalField>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} className="lr-btn-primary flex-1">
                {editing ? 'Save changes' : 'Send invite'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditing(null);
                  resetForm();
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

function ModalInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold)"
      style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
    />
  );
}
