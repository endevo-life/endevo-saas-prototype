'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockEmployees, mockOrganizations } from '@/lib/mock-data';
import { useState } from 'react';
import { useToast } from '@/components/common/Toast';
import LRMonogram from '@/components/common/LRMonogram';

type Tab = 'profile' | 'preferences' | 'security';

export default function MemberProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  if (!user) return null;

  const employee = mockEmployees.find((e) => e.email === user.email);
  const organization = mockOrganizations.find((o) => o.id === user.organizationId);

  const tabs: { id: Tab; label: string; eyebrow: string }[] = [
    { id: 'profile',     label: 'Profile',      eyebrow: '01' },
    { id: 'preferences', label: 'Preferences',  eyebrow: '02' },
    { id: 'security',    label: 'Security',     eyebrow: '03' },
  ];

  return (
    <DashboardLayout title="My Profile" role="org_member">
      {/* Hero — identity card */}
      <section
        className="rounded-[18px] mb-7 px-8 py-7 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 opacity-15">
          <LRMonogram size={240} />
        </div>

        <div className="relative flex flex-wrap items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-(family-name:--font-jura) text-xl tracking-wider"
              style={{
                background: 'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-midnight) 100%)',
                color: 'var(--lr-gold)',
                border: '1px solid var(--lr-gold)',
              }}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
                Member
              </p>
              <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-3xl tracking-[0.05em] mt-1 leading-tight">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-(--lr-pearl) opacity-85 mt-1">{user.email}</p>
              <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase text-(--lr-gold-soft) mt-1.5">
                {organization?.name ?? 'Endevo'} · {employee?.department ?? 'Member'}
              </p>
            </div>
          </div>

          <button
            onClick={() => toast('Edit profile — coming next', 'info')}
            className="lr-btn-primary"
          >
            Edit profile
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.2em] uppercase px-5 py-2.5 rounded-[10px] transition-all"
              style={{
                background: active ? 'var(--lr-gold)' : 'rgba(212,190,148,0.06)',
                color: active ? 'var(--lr-navy-deep)' : 'var(--lr-pearl)',
                border: active ? '1px solid var(--lr-gold)' : '1px solid var(--border-subtle)',
              }}
            >
              <span className="opacity-70 mr-2">{t.eyebrow}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        className="rounded-[14px] p-7"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {activeTab === 'profile' && (
          <div className="space-y-7">
            <div>
              <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                Personal
              </p>
              <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-5">
                Who you are
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="First name" value={user.firstName} />
                <Field label="Last name"  value={user.lastName} />
                <Field label="Email"      value={user.email}      readOnly />
                <Field label="Organization" value={organization?.name ?? 'Endevo'} readOnly />
              </div>
            </div>

            {employee && (
              <>
                <hr className="lr-separator" />
                <div>
                  <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                    Work
                  </p>
                  <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-5">
                    Where you serve
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Job title"  value={employee.jobTitle} />
                    <Field label="Department" value={employee.department} />
                    <Field label="Hire date"  value={new Date(employee.hireDate).toLocaleDateString()} readOnly />
                    <Field label="Status"     value={employee.status} readOnly />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-7">
            <div>
              <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                Notifications
              </p>
              <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-5">
                What reaches you, and when
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Email updates',       desc: 'A note when something on your path moves.' },
                  { label: 'Lesson reminders',    desc: 'A gentle nudge when a lesson sits unfinished.' },
                  { label: 'Playbook chapters',   desc: 'When a chapter of your FinalPlaybook is ready.' },
                  { label: 'Weekly reflection',   desc: 'A short summary every Sunday evening.' },
                ].map((item) => (
                  <PrefRow key={item.label} label={item.label} desc={item.desc} />
                ))}
              </div>
            </div>

            <hr className="lr-separator" />

            <div>
              <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                Display
              </p>
              <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-5">
                How the platform feels
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectField label="Language" options={['English (US)', 'Spanish', 'French']} />
                <SelectField
                  label="Timezone"
                  options={[
                    'UTC-5 (Eastern)',
                    'UTC-6 (Central)',
                    'UTC-7 (Mountain)',
                    'UTC-8 (Pacific)',
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-7">
            <div>
              <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                Password
              </p>
              <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-5">
                Update your sign-in
              </h3>
              <div className="space-y-4 max-w-lg">
                <PasswordField label="Current password" placeholder="Enter current password" />
                <PasswordField label="New password"     placeholder="Enter new password" />
                <PasswordField label="Confirm new password" placeholder="Confirm new password" />
                <button onClick={() => toast('Password updated', 'success')} className="lr-btn-primary">
                  Update password
                </button>
              </div>
            </div>

            <hr className="lr-separator" />

            <div>
              <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                Two-factor
              </p>
              <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-3">
                A second layer of care
              </h3>
              <div
                className="rounded-[12px] p-5 flex items-center justify-between gap-4 flex-wrap"
                style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
              >
                <p className="text-sm text-(--lr-pearl) opacity-90 max-w-md">
                  Add an extra step at sign-in. We send a one-time code to your trusted device whenever you
                  return to your Legacy Path.
                </p>
                <button onClick={() => toast('Two-factor enabled', 'success')} className="lr-btn-outline" style={{ color: 'var(--lr-gold)' }}>
                  Enable 2FA
                </button>
              </div>
            </div>

            <hr className="lr-separator" />

            <div>
              <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                Sessions
              </p>
              <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-3">
                Where you're signed in
              </h3>
              <div
                className="rounded-[12px] px-5 py-4 flex items-center justify-between gap-4"
                style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="min-w-0">
                  <p className="text-sm text-(--lr-pearl)">This device</p>
                  <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.2em] uppercase text-(--lr-gold-soft) mt-0.5">
                    Windows · Chrome · {new Date().toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{ color: 'var(--lr-navy-deep)', background: 'var(--lr-gold)', border: '1px solid var(--lr-gold)' }}
                >
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Privacy footer */}
      <div
        className="mt-7 rounded-[14px] px-6 py-4 flex items-start gap-3"
        style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
      >
        <span className="text-(--lr-gold) leading-none mt-0.5 text-lg">◆</span>
        <p className="text-sm text-(--lr-pearl) leading-relaxed opacity-90">
          <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-[0.7rem] text-(--lr-gold) block mb-1">
            Your account, your control
          </span>
          Your reflections, lesson notes, and FinalPlaybook content stay with you. Your employer sees only
          completion status — never the contents of your path.
        </p>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <label className="block">
      <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase block mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </span>
      <input
        type="text"
        {...(readOnly ? { value, readOnly: true } : { defaultValue: value })}
        className="w-full rounded-[10px] px-4 py-2.5 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold) transition-colors"
        style={{
          background: readOnly ? 'rgba(28,38,68,0.4)' : 'rgba(28,38,68,0.7)',
          border: '1px solid var(--border-subtle)',
        }}
      />
    </label>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase block mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </span>
      <select
        className="w-full rounded-[10px] px-4 py-2.5 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold) transition-colors"
        style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ background: 'var(--lr-navy-deep)' }}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function PasswordField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase block mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </span>
      <input
        type="password"
        placeholder={placeholder}
        className="w-full rounded-[10px] px-4 py-2.5 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold) transition-colors"
        style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
      />
    </label>
  );
}

function PrefRow({ label, desc }: { label: string; desc: string }) {
  const [on, setOn] = useState(true);
  return (
    <div
      className="rounded-[12px] px-5 py-4 flex items-center justify-between gap-4"
      style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="min-w-0">
        <p className="text-sm text-(--lr-pearl)">{label}</p>
        <p className="text-xs text-(--lr-lavender-dust) mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={() => setOn((o) => !o)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{
          background: on ? 'var(--lr-gold)' : 'rgba(212,190,148,0.18)',
          border: '1px solid var(--lr-gold)',
        }}
        aria-label={`Toggle ${label}`}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
          style={{
            left: on ? 'calc(100% - 1.125rem)' : '0.125rem',
            background: on ? 'var(--lr-navy-deep)' : 'var(--lr-pearl)',
          }}
        />
      </button>
    </div>
  );
}
