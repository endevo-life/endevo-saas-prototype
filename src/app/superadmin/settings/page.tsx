'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/common/Toast';
import LRMonogram from '@/components/common/LRMonogram';

type Tab = 'platform' | 'features' | 'modules' | 'billing' | 'maintenance';

interface FeatureFlag {
  key: string;
  label: string;
  desc: string;
  defaultOn: boolean;
}

const FEATURE_FLAGS: FeatureFlag[] = [
  { key: 'jesse',     label: 'Ask Jesse — AI guide',  desc: 'In-app conversational helper for members',                defaultOn: true  },
  { key: 'analytics', label: 'Advanced analytics',     desc: 'Cross-tenant charts, band distribution, exports',         defaultOn: true  },
  { key: 'branding',  label: 'Tenant brand kits',      desc: 'Per-org logo, accent color, custom subdomain',            defaultOn: true  },
  { key: 'i18n',      label: 'Multi-language',         desc: 'English, Spanish, French — opt in per tenant',            defaultOn: false },
  { key: 'email',     label: 'Email notifications',    desc: 'Onboarding, weekly digest, milestone alerts',             defaultOn: true  },
  { key: 'video',     label: 'Video lessons',          desc: 'Embedded MP4 playback inside lesson modules',             defaultOn: true  },
  { key: 'audit',     label: 'Audit log streaming',    desc: 'Forward events to customer SIEM (enterprise tier only)',  defaultOn: false },
];

const TIERS = [
  { tier: 'Basic',        price: '$99/mo',   seats: '10',  features: 'Core 4 domains · FinalPlaybook' },
  { tier: 'Professional', price: '$299/mo',  seats: '50',  features: 'Core + cohort analytics + exports' },
  { tier: 'Enterprise',   price: '$999/mo',  seats: '500', features: 'All + brand kit + audit streaming + SLA' },
];

export default function PlatformSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('platform');

  if (!user) return null;

  const tabs: { id: Tab; label: string; eyebrow: string }[] = [
    { id: 'platform',    label: 'Platform',    eyebrow: '01' },
    { id: 'features',    label: 'Features',    eyebrow: '02' },
    { id: 'modules',     label: 'Modules',     eyebrow: '03' },
    { id: 'billing',     label: 'Billing',     eyebrow: '04' },
    { id: 'maintenance', label: 'Maintenance', eyebrow: '05' },
  ];

  return (
    <DashboardLayout title="Platform Settings" role="super_admin">
      {/* Hero */}
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

        <div className="relative">
          <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
            Endevo Platform
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-3xl tracking-[0.05em] leading-tight">
            Govern the platform that runs every tenant
          </h2>
          <p className="text-(--lr-pearl) mt-3 max-w-xl leading-relaxed opacity-90">
            Changes here propagate across all customer organizations. Treat with care — every toggle has
            audit-log consequences.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
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
        {tab === 'platform' && (
          <div className="space-y-7">
            <Section eyebrow="Identity" title="Platform identity">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Platform name" defaultValue="ENDevo · Legacy Readiness OS" />
                <Field label="Support email" defaultValue="support@endevo.life" />
                <Field label="Status page URL" defaultValue="status.endevo.life" />
                <Field label="Marketing site URL" defaultValue="endevo.life" />
              </div>
            </Section>

            <hr className="lr-separator" />

            <Section eyebrow="Limits" title="Platform-wide limits">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Max tenants on platform" defaultValue="100" type="number" />
                <Field label="Default seat limit per tenant" defaultValue="500" type="number" />
                <Field label="FinalPlaybook retention (years)" defaultValue="7" type="number" />
                <Field label="Audit log retention (years)" defaultValue="7" type="number" />
              </div>
            </Section>
          </div>
        )}

        {tab === 'features' && (
          <div className="space-y-3">
            <Section eyebrow="Feature flags" title="What ships to every tenant">
              <p className="text-xs text-(--lr-lavender-dust) mb-4 leading-relaxed">
                Flags marked enterprise-only are gated by subscription tier even when toggled on.
              </p>
              <div className="space-y-2.5">
                {FEATURE_FLAGS.map((f) => (
                  <FeatureRow key={f.key} flag={f} />
                ))}
              </div>
            </Section>
          </div>
        )}

        {tab === 'modules' && (
          <div className="space-y-7">
            <Section eyebrow="Lessons" title="Module defaults">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Default duration (hours)" defaultValue="2.5" type="number" />
                <Field label="Lessons per module" defaultValue="5" type="number" />
                <Field label="Completion threshold (%)" defaultValue="80" type="number" />
              </div>
            </Section>

            <hr className="lr-separator" />

            <Section eyebrow="Editorial" title="Content review">
              <div className="space-y-2">
                {[
                  { label: 'Require Super Admin review before publish', on: true },
                  { label: 'Auto-archive lessons unedited for 365 days', on: false },
                  { label: 'Send change-log to org admins on publish', on: true },
                ].map((item) => (
                  <PrefRow key={item.label} label={item.label} desc="" defaultOn={item.on} />
                ))}
              </div>
            </Section>
          </div>
        )}

        {tab === 'billing' && (
          <div className="space-y-7">
            <Section eyebrow="Pricing" title="Subscription tiers">
              <div className="space-y-3">
                {TIERS.map((plan) => (
                  <div
                    key={plan.tier}
                    className="rounded-[12px] px-6 py-5 flex items-center gap-5 flex-wrap"
                    style={{
                      background: 'rgba(212,190,148,0.04)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em]">
                        {plan.tier}
                      </p>
                      <p className="text-xs text-(--lr-pearl) opacity-80 mt-1">{plan.features}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-base">{plan.price}</p>
                      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust) mt-0.5">
                        Up to {plan.seats} seats
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <hr className="lr-separator" />

            <Section eyebrow="Provider" title="Payment processor">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Stripe account" defaultValue="acct_•••••• live" readOnly />
                <Field label="Default currency" defaultValue="USD" readOnly />
                <Field label="Invoice prefix" defaultValue="ENDV-" />
                <Field label="Net terms (days)" defaultValue="30" type="number" />
              </div>
            </Section>
          </div>
        )}

        {tab === 'maintenance' && (
          <div className="space-y-3">
            <Section eyebrow="Operations" title="System operations">
              <p className="text-xs text-(--lr-lavender-dust) mb-4 leading-relaxed">
                These actions are logged in audit logs with severity <span className="text-(--lr-gold)">warn</span>.
              </p>

              <div className="space-y-2">
                <ActionRow
                  label="Export all platform data"
                  hint="Tenants, members, lessons, progress — encrypted .zip"
                  onClick={() => toast('Export queued — you\'ll be emailed when ready', 'success')}
                />
                <ActionRow
                  label="Generate system report"
                  hint="Health check across services, jobs, integrations"
                  onClick={() => toast('System report generated — see audit logs', 'success')}
                />
                <ActionRow
                  label="Clear application cache"
                  hint="Forces all clients to re-fetch on next request"
                  onClick={() => toast('Cache cleared platform-wide', 'success')}
                />
                <ActionRow
                  label="Enter maintenance mode"
                  hint="All non-admin sessions return a maintenance banner"
                  onClick={() => toast('Maintenance mode requires confirmation step', 'warn')}
                  destructive
                />
              </div>
            </Section>
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={() => toast('No changes to discard', 'info')}
          className="lr-btn-outline"
          style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}
        >
          Discard
        </button>
        <button
          onClick={() => toast('Settings saved — propagating to tenants', 'success')}
          className="lr-btn-primary"
        >
          Save changes
        </button>
      </div>

      {/* Audit-log footer */}
      <div
        className="mt-7 rounded-[14px] px-6 py-4 flex items-start gap-3"
        style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
      >
        <span className="text-(--lr-gold) leading-none mt-0.5 text-lg">◆</span>
        <p className="text-sm text-(--lr-pearl) leading-relaxed opacity-90">
          <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-[0.7rem] text-(--lr-gold) block mb-1">
            Every change is recorded
          </span>
          Saving here writes a config event to the audit log with your identity, IP, and the previous value of each
          changed field. See <span className="text-(--lr-gold-soft)">Audit Logs → Config</span>.
        </p>
      </div>
    </DashboardLayout>
  );
}

/* ──────────── primitives ──────────── */

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
        {eyebrow}
      </p>
      <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-5">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = 'text',
  readOnly,
}: {
  label: string;
  defaultValue: string;
  type?: 'text' | 'number' | 'email';
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase block mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </span>
      <input
        type={type}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className="w-full rounded-[10px] px-4 py-2.5 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold) transition-colors"
        style={{
          background: readOnly ? 'rgba(28,38,68,0.4)' : 'rgba(28,38,68,0.7)',
          border: '1px solid var(--border-subtle)',
        }}
      />
    </label>
  );
}

function FeatureRow({ flag }: { flag: FeatureFlag }) {
  const [on, setOn] = useState(flag.defaultOn);
  return (
    <div
      className="rounded-[12px] px-5 py-4 flex items-center justify-between gap-4"
      style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="min-w-0">
        <p className="text-sm text-(--lr-pearl)">{flag.label}</p>
        <p className="text-xs text-(--lr-lavender-dust) mt-0.5 leading-relaxed">{flag.desc}</p>
      </div>
      <Toggle on={on} onChange={() => setOn((o) => !o)} label={flag.label} />
    </div>
  );
}

function PrefRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      className="rounded-[12px] px-5 py-4 flex items-center justify-between gap-4"
      style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="min-w-0">
        <p className="text-sm text-(--lr-pearl)">{label}</p>
        {desc && <p className="text-xs text-(--lr-lavender-dust) mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <Toggle on={on} onChange={() => setOn((o) => !o)} label={label} />
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
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
  );
}

function ActionRow({
  label,
  hint,
  onClick,
  destructive,
}: {
  label: string;
  hint: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[12px] px-5 py-4 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5"
      style={{
        background: destructive ? 'rgba(166,84,84,0.08)' : 'rgba(212,190,148,0.04)',
        border: destructive ? '1px solid rgba(166,84,84,0.4)' : '1px solid var(--border-subtle)',
      }}
    >
      <div className="min-w-0">
        <p className="text-sm" style={{ color: destructive ? '#D49494' : 'var(--lr-pearl)' }}>
          {label}
        </p>
        <p className="text-xs text-(--lr-lavender-dust) mt-0.5 leading-relaxed">{hint}</p>
      </div>
      <span className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.22em] uppercase flex-shrink-0" style={{ color: destructive ? '#D49494' : 'var(--lr-gold)' }}>
        →
      </span>
    </button>
  );
}
