'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockOrganizations, mockEmployees, mockProgress, mockModules } from '@/lib/mock-data';
import { LRColors } from '@/lib/theme';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const tooltipStyle = {
  background: LRColors.midnight,
  border: `1px solid ${LRColors.gold}`,
  borderRadius: 8,
  color: LRColors.pearl,
  fontFamily: 'var(--font-jura)',
  fontSize: 12,
  letterSpacing: '0.05em',
};

const axisTick = {
  fontSize: 11,
  fontFamily: 'var(--font-jura)',
  fill: LRColors.lavenderDust,
  letterSpacing: '0.12em',
};

const axisDataTick = {
  fontSize: 11,
  fontFamily: 'var(--font-jetbrains)',
  fill: LRColors.lavenderDust,
};

export default function AdminAnalyticsPage() {
  const platformStats = {
    totalOrgs: mockOrganizations.length,
    totalEmployees: mockEmployees.length,
    totalCompletions: mockProgress.reduce((sum, p) => sum + p.completedModules.length, 0),
    avgCompletion: Math.round(
      (mockProgress.reduce((sum, p) => sum + p.completedModules.length, 0) /
        Math.max(mockEmployees.length * mockModules.length, 1)) *
        100
    ),
  };

  const orgPerformance = mockOrganizations.map((org) => {
    const orgEmployees = mockEmployees.filter((e) => e.organizationId === org.id);
    const orgProgress = mockProgress.filter((p) => orgEmployees.some((e) => e.id === p.employeeId));
    const completions = orgProgress.reduce((sum, p) => sum + p.completedModules.length, 0);
    const avg =
      orgEmployees.length > 0
        ? Math.round((completions / Math.max(orgEmployees.length * mockModules.length, 1)) * 100)
        : 0;
    return { name: org.name, completion: avg, members: orgEmployees.length };
  });

  const tierDistribution = (['basic', 'professional', 'enterprise'] as const).map((tier) => ({
    tier: tier.charAt(0).toUpperCase() + tier.slice(1),
    count: mockOrganizations.filter((o) => o.subscriptionTier === tier).length,
  }));

  const topModules = mockModules
    .map((m) => ({
      name: m.title.length > 22 ? m.title.slice(0, 20) + '…' : m.title,
      completions: mockProgress.filter((p) => p.completedModules.includes(m.id)).length,
    }))
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 5);

  return (
    <DashboardLayout title="Cross-tenant analytics" role="super_admin">
      <div className="mb-6">
        <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
          Platform overview
        </p>
        <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mt-1">
          Real-time across every tenant
        </h2>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Stat label="Tenants" value={String(platformStats.totalOrgs)} accent />
        <Stat label="Members" value={String(platformStats.totalEmployees)} />
        <Stat label="Lesson completions" value={String(platformStats.totalCompletions)} />
        <Stat label="Avg completion" value={`${platformStats.avgCompletion}%`} />
      </div>

      {/* Org performance bar chart */}
      <ChartCard
        eyebrow="Tenants"
        title="Tenant performance"
        insight={`${[...orgPerformance].sort((a, b) => b.completion - a.completion)[0]?.name} leads cross-tenant readiness.`}
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={orgPerformance} layout="vertical">
            <CartesianGrid stroke="rgba(212,190,148,0.08)" horizontal={false} />
            <XAxis type="number" tick={axisDataTick} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={axisTick} axisLine={false} tickLine={false} width={140} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(212,190,148,0.06)' }} />
            <Bar dataKey="completion" fill={LRColors.gold} radius={[0, 4, 4, 0]} name="Completion %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Side-by-side: top modules + tier distribution */}
      <div className="grid lg:grid-cols-2 gap-5 my-5">
        <ChartCard eyebrow="Engagement" title="Most-completed lessons" insight="Foundational lessons dominate. Action-item lessons see lower completion.">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topModules}>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} angle={-25} textAnchor="end" height={80} axisLine={false} tickLine={false} />
              <YAxis tick={axisDataTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(212,190,148,0.06)' }} />
              <Bar dataKey="completions" fill={LRColors.gold} radius={[4, 4, 0, 0]} name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard eyebrow="Subscriptions" title="Tier distribution" insight={`${tierDistribution.find((t) => t.tier === 'Enterprise')?.count ?? 0} tenants on Enterprise tier.`}>
          <div className="space-y-4 mt-3">
            {tierDistribution.map((t) => {
              const total = tierDistribution.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? Math.round((t.count / total) * 100) : 0;
              return (
                <div key={t.tier}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.2em] uppercase text-(--lr-pearl)">
                      {t.tier}
                    </span>
                    <span className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm">
                      {t.count} <span className="text-(--lr-lavender-dust)">/ {pct}%</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(212,190,148,0.12)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'var(--lr-gold)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Recent activity */}
      <div
        className="rounded-[14px] p-6"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
          Activity
        </p>
        <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-4">
          Recent platform events
        </h3>

        <div className="space-y-2">
          {[
            { who: 'Sarah Mitchell',  what: 'completed "Plan Your Will" lesson',         when: '12 min ago' },
            { who: 'Marcus Reed',     what: 'began "Map Your Financial Accounts"',         when: '38 min ago' },
            { who: 'XYZ Company',     what: 'upgraded Innovate Labs to Enterprise tier',    when: '4 hours ago' },
            { who: 'Aisha Patel',     what: 'joined as a new member',                       when: 'today' },
            { who: 'Jennifer Chen',   what: 'sent a cohort reminder',                       when: 'yesterday' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(212,190,148,0.04)' }}>
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-(--lr-gold) text-sm flex-shrink-0"
                style={{ background: 'rgba(212,190,148,0.1)', border: '1px solid var(--border-gold)' }}
              >
                ◆
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-(--lr-pearl) truncate">
                  <span className="text-(--lr-gold)">{a.who}</span> {a.what}
                </p>
                <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.2em] uppercase text-(--lr-gold-soft) mt-0.5">
                  {a.when}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
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

function ChartCard({ eyebrow, title, insight, children }: { eyebrow: string; title: string; insight: string; children: React.ReactNode }) {
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
      <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1 mb-4">
        {title}
      </h3>
      {children}
      <hr className="lr-separator my-4" />
      <p className="text-xs text-(--lr-pearl) opacity-85 leading-relaxed">
        <span className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase mr-2 text-(--lr-gold)">
          Insight
        </span>
        {insight}
      </p>
    </div>
  );
}
