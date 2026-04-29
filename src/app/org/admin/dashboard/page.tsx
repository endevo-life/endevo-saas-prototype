'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees, mockOrganizations } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LRColors } from '@/lib/theme';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function HRDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [showReminderModal, setShowReminderModal] = useState(false);

  const organization = mockOrganizations.find((o) => o.id === user?.organizationId);
  const orgEmployees = mockEmployees.filter(
    (e) => e.organizationId === user?.organizationId && e.role === 'org_member'
  );

  const totalEmployees = orgEmployees.length;
  const enrolled = orgEmployees.filter((e) => e.onboardedAt).length;
  const enrolledPct = Math.round((enrolled / totalEmployees) * 100);
  const completed = orgEmployees.filter((e) => e.progressPercentage === 100).length;
  const avgReadiness = Math.round(
    orgEmployees.reduce((sum, e) => sum + e.progressPercentage, 0) / totalEmployees
  );

  const weeklyTrend = [
    { week: 'W14', readiness: 12, lessons: 8 },
    { week: 'W15', readiness: 18, lessons: 14 },
    { week: 'W16', readiness: 26, lessons: 22 },
    { week: 'W17', readiness: 34, lessons: 31 },
  ];

  const domainEngagement = [
    { domain: '01 Legal',     value: 64 },
    { domain: '02 Financial', value: 41 },
    { domain: '03 Digital',   value: 28 },
    { domain: '04 Physical',  value: 12 },
  ];

  return (
    <DashboardLayout title="Cohort Readiness" role="org_admin">
      {/* Privacy banner */}
      <div
        className="rounded-[14px] mb-6 px-5 py-4"
        style={{
          background: 'rgba(212,190,148,0.08)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-(--lr-gold) text-lg leading-none mt-0.5">◆</span>
          <p className="text-sm text-(--lr-pearl) leading-relaxed opacity-90">
            <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-[0.7rem] text-(--lr-gold) block mb-1">
              Privacy by design
            </span>
            You see only aggregate metrics across your workforce. Individual answers, reflections, and
            content are never visible — to you, to Endevo, or to anyone outside the member's own
            account.
          </p>
        </div>
      </div>

      {/* Org header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Tenant
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-3xl tracking-[0.06em] mt-1">
            {organization?.name}
          </h2>
          <p className="text-xs text-(--lr-lavender-dust) mt-1">
            {totalEmployees} active members · Enterprise tier
          </p>
        </div>
        <button onClick={() => router.push('/org/admin/analytics')} className="lr-btn-primary">
          Open analytics →
        </button>
      </div>

      {/* Top metrics — score-style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <Metric label="Avg. Readiness" value={`${avgReadiness}%`} sub={`across ${totalEmployees} members`} accent />
        <Metric label="Enrolled" value={`${enrolledPct}%`} sub={`${enrolled} of ${totalEmployees}`} />
        <Metric label="Completed Path" value={`${completed}`} sub={completed === 1 ? 'member' : 'members'} />
        <Metric label="Active this week" value="4" sub="of 4 members" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        {/* Weekly trend */}
        <div
          className="rounded-[14px] p-6 lg:col-span-2"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
            Last four weeks
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-5">
            Readiness trajectory
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LRColors.gold} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={LRColors.gold} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="week" stroke={LRColors.lavenderDust} tick={{ fontSize: 11, fontFamily: 'var(--font-jura)', letterSpacing: '0.18em' }} axisLine={false} tickLine={false} />
              <YAxis stroke={LRColors.lavenderDust} tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: LRColors.midnight, border: `1px solid ${LRColors.gold}`, borderRadius: 8, color: LRColors.pearl, fontFamily: 'var(--font-jura)', fontSize: 12, letterSpacing: '0.05em' }} />
              <Area type="monotone" dataKey="readiness" stroke={LRColors.gold} strokeWidth={2} fill="url(#goldFade)" />
              <Area type="monotone" dataKey="lessons"   stroke={LRColors.steel} strokeWidth={1.5} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex gap-5 mt-3 pl-1">
            <Legend swatch={LRColors.gold} label="Avg. readiness %" />
            <Legend swatch={LRColors.steel} label="Lessons completed" />
          </div>
        </div>

        {/* Domain engagement */}
        <div
          className="rounded-[14px] p-6"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
            Where members focus
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-5">
            Domain engagement
          </h3>

          <div className="space-y-4">
            {domainEngagement.map((d) => (
              <div key={d.domain}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.18em] uppercase text-(--lr-pearl)">
                    {d.domain}
                  </span>
                  <span className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm">{d.value}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(212,190,148,0.12)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.value}%`, background: LRColors.gold }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="grid md:grid-cols-3 gap-5">
        <ActionCard
          eyebrow="Roster"
          title="Member roster"
          body="See progress per member, filter by department, watch the cohort grow."
          cta="View roster"
          onClick={() => router.push('/org/admin/employees')}
        />
        <ActionCard
          eyebrow="Engagement"
          title="Send a quiet reminder"
          body="A nudge to members who haven't begun. The message is yours; the data stays private."
          cta="Compose reminder"
          onClick={() => setShowReminderModal(true)}
        />
        <ActionCard
          eyebrow="Reports"
          title="Schedule a board report"
          body="Monthly readiness rollup delivered to your inbox — JetBrains Mono, on-letter, no PII."
          cta="Schedule report"
          onClick={() => alert('Report scheduling — demo placeholder')}
        />
      </div>

      {/* Reminder modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-[14px] p-7 max-w-md w-full"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-gold)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              Compose
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-4">
              Send a reminder
            </h3>
            <p className="text-sm text-(--lr-pearl) opacity-85 mb-4 leading-relaxed">
              Reach members who haven't begun their Legacy Path. The message is yours.
            </p>

            <textarea
              rows={4}
              defaultValue="A few minutes today saves your loved ones months of uncertainty. Your privacy is yours alone — your employer sees only that you began. — Jennifer"
              className="w-full rounded-[10px] px-4 py-3 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold) transition-colors resize-none mb-5"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
            />

            <div className="flex gap-3">
              <button onClick={() => { alert('Reminder queued for delivery.'); setShowReminderModal(false); }} className="lr-btn-primary flex-1">
                Send
              </button>
              <button onClick={() => setShowReminderModal(false)} className="lr-btn-outline" style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Metric({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
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
      <p className="text-xs text-(--lr-lavender-dust) mt-1.5">{sub}</p>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="block w-3 h-1 rounded-full" style={{ background: swatch }} />
      <span className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust)">
        {label}
      </span>
    </div>
  );
}

function ActionCard({ eyebrow, title, body, cta, onClick }: { eyebrow: string; title: string; body: string; cta: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-[14px] p-6 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
        {eyebrow}
      </p>
      <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-2">{title}</p>
      <p className="text-sm text-(--lr-pearl) opacity-85 leading-relaxed mb-5">{body}</p>
      <span className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.22em] uppercase text-(--lr-gold)">
        {cta} →
      </span>
    </button>
  );
}
