'use client';

import { useRef, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockOrganizations } from '@/lib/mock-data';
import { useToast } from '@/components/common/Toast';

interface NotificationPref {
  key: string;
  label: string;
  desc: string;
  enabled: boolean;
}

export default function HRSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const organization = mockOrganizations.find((o) => o.id === user?.organizationId);

  // Local form state — all wired
  const [orgName, setOrgName] = useState(organization?.name ?? '');
  const [supportEmail, setSupportEmail] = useState('readiness@xyzcompany.com');
  const [autoAssign, setAutoAssign] = useState(true);
  const [deadlineDays, setDeadlineDays] = useState(90);
  const [reminderFreq, setReminderFreq] = useState<'weekly' | 'biweekly' | 'monthly' | 'never'>('weekly');
  const [accentColor, setAccentColor] = useState('#D4BE94');
  const [logoUploaded, setLogoUploaded] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPref[]>([
    { key: 'enroll',     label: 'Enrollment notifications',  desc: 'Notify me when a new member begins their Legacy Path', enabled: true },
    { key: 'weekly',     label: 'Weekly cohort summary',      desc: 'Receive aggregate readiness rollup every Monday',     enabled: true },
    { key: 'completion', label: 'Domain completion alerts',   desc: 'Notify me when a member completes a full domain',     enabled: true },
    { key: 'lowEng',     label: 'Low-engagement signal',      desc: 'Flag members idle for 14+ days so I can reach out',   enabled: false },
    { key: 'band',       label: 'Band promotion alerts',      desc: 'Notify me when a member moves up a readiness band',   enabled: true },
  ]);

  const togglePref = (key: string) => {
    const next = prefs.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p));
    setPrefs(next);
    const target = next.find((p) => p.key === key);
    if (target) toast(`${target.label} ${target.enabled ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('Logo must be under 2MB', 'warn');
      return;
    }
    setLogoUploaded(true);
    toast(`Logo "${file.name}" uploaded`, 'success');
  };

  const handleSave = () => {
    if (!orgName.trim()) {
      toast('Organization name cannot be empty', 'warn');
      return;
    }
    if (!supportEmail.includes('@')) {
      toast('Enter a valid support email', 'warn');
      return;
    }
    toast('All settings saved', 'success');
  };

  return (
    <DashboardLayout title="Settings" role="org_admin">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Org settings */}
        <Section eyebrow="Tenant" title="Organization">
          <div className="space-y-4">
            <Field label="Organization name">
              <TextInput value={orgName} onChange={setOrgName} />
            </Field>
            <Field label="Support email">
              <TextInput value={supportEmail} onChange={setSupportEmail} type="email" />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ReadOnlyField label="Subscription tier" value={organization?.subscriptionTier ?? '—'} />
              <ReadOnlyField label="Status" value={organization?.status ?? '—'} />
              <ReadOnlyField label="Members" value={`${organization?.employeeCount ?? 0} / ${organization?.employeeLimit ?? 0}`} />
            </div>
          </div>
        </Section>

        {/* Notification preferences */}
        <Section eyebrow="Signals" title="Notification preferences">
          <div className="space-y-2">
            {prefs.map((p) => (
              <div
                key={p.key}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px]"
                style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-(--lr-pearl)">{p.label}</p>
                  <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
                    {p.desc}
                  </p>
                </div>
                <Toggle on={p.enabled} onChange={() => togglePref(p.key)} />
              </div>
            ))}
          </div>
        </Section>

        {/* Module assignment */}
        <Section eyebrow="Curriculum" title="Module assignment">
          <div className="space-y-4">
            <div
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px]"
              style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
            >
              <div>
                <p className="text-sm text-(--lr-pearl)">Auto-assign Legacy Path to new members</p>
                <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
                  Members are enrolled in all four domains the moment they accept the invite
                </p>
              </div>
              <Toggle on={autoAssign} onChange={() => { setAutoAssign(!autoAssign); toast(`Auto-assign ${!autoAssign ? 'enabled' : 'disabled'}`, 'info'); }} />
            </div>

            <Field label="Recommended completion window (days)">
              <input
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
              />
              <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-1">
                Soft window only · members are never penalised for going slowly
              </p>
            </Field>

            <Field label="Reminder cadence">
              <select
                value={reminderFreq}
                onChange={(e) => setReminderFreq(e.target.value as typeof reminderFreq)}
                className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
              >
                <option value="weekly" style={{ background: 'var(--lr-navy-deep)' }}>Weekly</option>
                <option value="biweekly" style={{ background: 'var(--lr-navy-deep)' }}>Bi-weekly</option>
                <option value="monthly" style={{ background: 'var(--lr-navy-deep)' }}>Monthly</option>
                <option value="never" style={{ background: 'var(--lr-navy-deep)' }}>Never</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Branding */}
        <Section eyebrow="Branding" title="Tenant accent">
          <div className="space-y-5">
            <Field label="Accent colour">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-14 h-10 rounded-[8px] cursor-pointer"
                  style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 rounded-[10px] px-3 py-2 text-sm font-(family-name:--font-jetbrains) text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                  style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
                />
                <button
                  onClick={() => { setAccentColor('#D4BE94'); toast('Accent reset to Champagne Gold', 'info'); }}
                  className="lr-btn-outline"
                  style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}
                >
                  Reset
                </button>
              </div>
              <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-1.5">
                Default is Champagne Gold (#D4BE94) per Eternal Geometry brand
              </p>
            </Field>

            <Field label="Tenant logo">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: logoUploaded ? 'rgba(212,190,148,0.12)' : 'rgba(28,38,68,0.7)',
                    border: logoUploaded ? '1px solid var(--lr-gold)' : '1px dashed rgba(212,190,148,0.3)',
                  }}
                >
                  <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: logoUploaded ? 'var(--lr-gold)' : 'var(--lr-lavender-dust)' }}>
                    {logoUploaded ? '✓ Uploaded' : 'Logo'}
                  </span>
                </div>
                <div className="flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                  <button onClick={() => fileRef.current?.click()} className="lr-btn-outline" style={{ color: 'var(--lr-gold)' }}>
                    {logoUploaded ? 'Replace logo' : 'Upload logo'}
                  </button>
                  <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-2">
                    PNG / JPG / SVG · max 2MB · displayed beside the platform mark in member nav
                  </p>
                </div>
              </div>
            </Field>
          </div>
        </Section>

        {/* Privacy & access */}
        <Section eyebrow="Boundaries" title="Privacy & access">
          <div
            className="rounded-[10px] p-4"
            style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold)' }}>
              What you can never see
            </p>
            <ul className="text-sm text-(--lr-pearl) opacity-90 leading-relaxed mt-2 space-y-1">
              <li>· Member answers, reflections, or letter content</li>
              <li>· Final Playbook chapters belonging to specific members</li>
              <li>· PHI / PII captured anywhere in the platform</li>
            </ul>
            <p className="text-xs text-(--lr-lavender-dust) leading-relaxed mt-3">
              By design. This is what makes Legacy Readiness OS approvable inside enterprise compliance.
            </p>
          </div>
        </Section>

        {/* Save bar */}
        <div className="sticky bottom-0 -mx-6 px-6 py-4" style={{ background: 'linear-gradient(to top, var(--lr-midnight), transparent)' }}>
          <div className="flex justify-end gap-3">
            <button onClick={() => toast('Settings reverted to last saved values', 'info')} className="lr-btn-outline" style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}>
              Discard changes
            </button>
            <button onClick={handleSave} className="lr-btn-primary">
              Save settings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[14px] p-6"
      style={{
        background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
        {eyebrow}
      </p>
      <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1 mb-5">
        {title}
      </h2>
      {children}
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="lr-eyebrow block mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </label>
      <div
        className="rounded-[10px] px-3 py-2 text-sm font-(family-name:--font-jetbrains) text-(--lr-pearl) capitalize"
        style={{ background: 'rgba(28,38,68,0.4)', border: '1px solid var(--border-subtle)' }}
      >
        {value}
      </div>
    </div>
  );
}

function TextInput({ value, onChange, type = 'text' }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
      style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
    />
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{
        background: on ? 'var(--lr-gold)' : 'rgba(212,190,148,0.15)',
        border: '1px solid var(--border-gold)',
      }}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{
          left: on ? '22px' : '2px',
          background: on ? 'var(--lr-navy-deep)' : 'var(--lr-pearl)',
        }}
      />
    </button>
  );
}
