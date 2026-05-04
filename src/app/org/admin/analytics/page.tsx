'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/common/Toast';
import { LRColors } from '@/lib/theme';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/* ──────────── synthetic enterprise-scale data ────────────
   Anchored to a 375-member workforce so the executive view
   tells a coherent story for the Cigna HR demo.            */

const cohortByDept = [
  { dept: 'Finance',     total: 100, started: 78, completed: 32, protected: 32 },
  { dept: 'Engineering', total: 85,  started: 71, completed: 38, protected: 38 },
  { dept: 'Marketing',   total: 42,  started: 36, completed: 22, protected: 22 },
  { dept: 'HR',          total: 28,  started: 24, completed: 19, protected: 19 },
  { dept: 'Operations',  total: 65,  started: 41, completed: 18, protected: 18 },
  { dept: 'Sales',       total: 55,  started: 28, completed: 12, protected: 12 },
];

const totalMembers   = cohortByDept.reduce((s, d) => s + d.total, 0);     // 375
const totalStarted   = cohortByDept.reduce((s, d) => s + d.started, 0);   // 278
const totalProtected = cohortByDept.reduce((s, d) => s + d.protected, 0); // 141

const startedDelta   = 23; // this week
const protectedDelta = 12; // this month

// Funnel — the journey from invitation to FinalPlaybook
const funnel = [
  { label: 'Invited',                  count: 375 },
  { label: 'Started Assessment',       count: 278 },
  { label: 'Completed Assessment',     count: 211 },
  { label: 'Started Action Plan',      count: 167 },
  { label: 'Completed Action Plan',    count: 141 },
  { label: 'FinalPlaybook ready',     count:  89 },
];

// Cohort completion — three-way split for the donut
const completionData = [
  { name: 'Complete',    value: 89,  color: LRColors.gold },
  { name: 'In progress', value: 189, color: LRColors.steel },
  { name: 'Not started', value: 97,  color: LRColors.lavenderDust },
];

// Per-dept × per-domain readiness (the grouped bar chart)
const deptDomainReadiness = [
  { dept: 'Finance',     legal: 64, financial: 80, digital: 50, physical: 28 },
  { dept: 'Engineering', legal: 58, financial: 49, digital: 60, physical: 41 },
  { dept: 'Marketing',   legal: 60, financial: 56, digital: 52, physical: 38 },
  { dept: 'HR',          legal: 71, financial: 49, digital: 50, physical: 41 },
  { dept: 'Operations',  legal: 50, financial: 38, digital: 40, physical: 30 },
  { dept: 'Sales',       legal: 41, financial: 47, digital: 30, physical: 28 },
];

// Action items completed across the four domains
const actionItems = {
  total: 1847,
  members: 142,
  thisWeek: 18,
  thisMonth: 72,
  avgPerMember: 13,
};

// LMS lessons — completions split across the 6 LRos lesson topics
const lmsTopics = [
  { topic: 'Project Plan',   completions: 248, members: 124 },
  { topic: 'Legal',          completions: 312, members: 168 },
  { topic: 'Financial',      completions: 268, members: 134 },
  { topic: 'Digital',        completions: 198, members:  98 },
  { topic: 'Physical',       completions: 142, members:  76 },
  { topic: 'Communication',  completions:  89, members:  54 },
];
const lmsTotal = lmsTopics.reduce((s, t) => s + t.completions, 0); // 1,257

// Weekly engagement trajectory (active members + completions per week)
const weeklyEngagement = [
  { week: 'W14', active:  31, completed:  6 },
  { week: 'W15', active:  64, completed: 12 },
  { week: 'W16', active:  91, completed: 22 },
  { week: 'W17', active: 112, completed: 31 },
];

// The differentiator — real-world artifacts members self-attested to.
// Endevo never stores the document itself; members tick a box confirming
// it's in place.
const artifacts = [
  { label: 'with wills in place',           count: 67 },
  { label: 'with healthcare directives',    count: 41 },
  { label: 'with digital vaults set up',    count: 34 },
];
const totalArtifacts = artifacts.reduce((s, a) => s + a.count, 0); // 142

// Most active — kept for the Cigna demo
const topPerformers = [
  { id: 'tp-1', name: 'Sarah Mitchell', dept: 'Caregiver Solutions', completed: 6, total: 6 },
  { id: 'tp-2', name: 'Marcus Reed',    dept: 'Chronic Disease',     completed: 4, total: 6 },
  { id: 'tp-3', name: 'David Kim',      dept: 'Member Experience',   completed: 3, total: 6 },
  { id: 'tp-4', name: 'Aisha Patel',    dept: 'Caregiver Solutions', completed: 2, total: 6 },
];

const REPORT_TEMPLATES = [
  { id: 'cohort',     label: 'Cohort summary',         desc: 'High-level rollup of the past 30 days — bands, completion, hours invested.' },
  { id: 'department', label: 'Department breakdown',   desc: 'Per-department engagement and readiness — ideal for HR partner reviews.' },
  { id: 'at-risk',    label: 'At-risk members',        desc: 'Members idle 7+ days or under 25% readiness — surfaces who needs a nudge.' },
  { id: 'artifacts',  label: 'Artifacts report',       desc: 'Real-world legacy documents now in place — wills, directives, vaults.' },
  { id: 'board',      label: 'Quarterly board report', desc: 'Executive PDF — clean letter, no PII, ready to send to leadership.' },
  { id: 'compliance', label: 'Compliance bundle',      desc: 'Audit-ready signed export — events + aggregate metrics, no member content.' },
];

type Range = 'weekly' | 'monthly';

// Tooltip chrome — works against both dark and light themes.
// Uses CSS variables so it auto-adapts when the user toggles light mode.
const tooltipStyle = {
  background: 'var(--lr-navy-deep)',
  border: `1px solid ${LRColors.gold}`,
  borderRadius: 8,
  color: LRColors.pearl,
  fontFamily: 'var(--font-jura)',
  fontSize: 12,
  letterSpacing: '0.05em',
  boxShadow: '0 12px 28px -10px rgba(0,0,0,0.45)',
  padding: '8px 12px',
};

// Force every text row inside the tooltip to use pearl — recharts defaults to
// black, which is invisible on the dark navy backdrop.
const tooltipItemStyle  = { color: LRColors.pearl, fontFamily: 'var(--font-jura)', fontSize: 12 };
const tooltipLabelStyle = { color: LRColors.gold,  fontFamily: 'var(--font-jura)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, marginBottom: 4 };

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

const legendStyle = {
  fontFamily: 'var(--font-jura)',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: LRColors.pearl,
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [range, setRange] = useState<Range>('monthly');
  const [showExportMenu, setShowExportMenu] = useState(false);
  if (!user) return null;

  const startedPct   = Math.round((totalStarted   / totalMembers) * 100);
  const protectedPct = Math.round((totalProtected / totalMembers) * 100);

  const handleExport = (format: 'csv' | 'txt') => {
    setShowExportMenu(false);
    const today = new Date().toISOString().split('T')[0];
    if (format === 'csv') {
      const rows = [
        ['Department', 'Members', 'Started', 'Protected', 'Engagement %'],
        ...cohortByDept.map((d) => [d.dept, String(d.total), String(d.started), String(d.protected), `${Math.round((d.started / d.total) * 100)}%`]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      downloadBlob(csv, `analytics_${today}.csv`, 'text/csv');
    } else {
      const txt = `WORKFORCE READINESS — ${today.toUpperCase()}\n\n${totalProtected} of ${totalMembers} members protected · ${totalArtifacts} legacy documents now exist`;
      downloadBlob(txt, `analytics_${today}.txt`, 'text/plain');
    }
    toast(`Exported ${cohortByDept.length}-row report`, 'success');
  };

  const handleGenerateReport = (id: string) => {
    const tmpl = REPORT_TEMPLATES.find((t) => t.id === id);
    toast(`${tmpl?.label} drafting — check your inbox in ~2 min`, 'success');
  };

  return (
    <DashboardLayout title="Analytics" role="org_admin">
      {/* Header */}
      <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Workforce overview · last 30 days
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-3xl tracking-[0.06em] mt-1">
            How is this benefit doing?
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => { setRange('weekly'); toast('Switched to weekly window', 'info'); }}
            className="lr-btn-outline"
            style={{
              color: range === 'weekly' ? 'var(--lr-navy-deep)' : 'var(--lr-pearl)',
              borderColor: 'var(--lr-pearl)',
              background: range === 'weekly' ? 'var(--lr-pearl)' : 'transparent',
            }}
          >
            Weekly
          </button>
          <button
            onClick={() => { setRange('monthly'); toast('Switched to monthly window', 'info'); }}
            className="lr-btn-outline"
            style={{
              color: range === 'monthly' ? 'var(--lr-navy-deep)' : 'var(--lr-pearl)',
              borderColor: 'var(--lr-pearl)',
              background: range === 'monthly' ? 'var(--lr-pearl)' : 'transparent',
            }}
          >
            Monthly
          </button>
          <div className="relative">
            <button onClick={() => setShowExportMenu((o) => !o)} className="lr-btn-primary">
              Export ▾
            </button>
            {showExportMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-[10px] overflow-hidden z-30"
                style={{
                  background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                  border: '1px solid var(--border-gold)',
                  boxShadow: '0 18px 40px -16px rgba(0,0,0,0.55)',
                }}
              >
                <ExportOption label="As text (.txt)" hint="Plain summary" onClick={() => handleExport('txt')} />
                <ExportOption label="As spreadsheet (.csv)" hint="One row per dept" onClick={() => handleExport('csv')} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* ═══ HEADLINE — 3 outcome cards ═══ */}
        <section className="grid md:grid-cols-3 gap-5">
          <OutcomeCard
            eyebrow="Outcome"
            primary={`${totalProtected} of ${totalMembers}`}
            label="Members protected"
            sub={`Completed an action plan in ≥1 domain · +${protectedDelta} this month`}
            accent
          />
          <OutcomeCard
            eyebrow="Adoption"
            primary={`${startedPct}%`}
            label="Have started"
            sub={`${totalStarted} of ${totalMembers} · +${startedDelta} this week`}
          />
          <OutcomeCard
            eyebrow="Real-world impact"
            primary={String(totalArtifacts)}
            label="Documents self-attested"
            sub={`${artifacts.map((a) => `${a.count} ${a.label}`).join(' · ')} — never uploaded, only confirmed`}
            accent
          />
        </section>

        {/* This week narrative */}
        <div
          className="rounded-[14px] px-6 py-5 flex items-start gap-3"
          style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
        >
          <span className="text-(--lr-gold) leading-none mt-0.5 text-lg">◆</span>
          <p className="text-sm text-(--lr-pearl) leading-relaxed opacity-90">
            <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-[0.7rem] text-(--lr-gold) block mb-1">
              This week at a glance
            </span>
            <span className="text-(--lr-gold)">+{startedDelta} new starts</span> · Finance crossed 50% engagement ·
            <span className="text-(--lr-gold)"> 4 members attested a will is in place</span> · Marcus Reed reached Custodian level.
            Your workforce is on track to confirm <span className="text-(--lr-gold)">200+ legacy documents</span> are in place by Q3
            <span className="opacity-70"> — we never see the documents, only that members say they exist.</span>
          </p>
        </div>

        {/* ═══ COHORT COMPLETION — donut ═══ */}
        <ChartCard
          eyebrow="Status"
          title="Cohort completion"
          insight={`${completionData[0].value} of ${totalMembers} members have completed all four domains.`}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke={LRColors.midnight}
                strokeWidth={2}
              >
                {completionData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(value, name) => {
                  const count = Number(value);
                  const pct = Math.round((count / totalMembers) * 100);
                  return [`${count} members (${pct}%)`, String(name)];
                }}
              />
              <Legend wrapperStyle={legendStyle} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ═══ ENGAGEMENT BY DEPARTMENT — grouped bars ═══ */}
        <ChartCard
          eyebrow="Engagement"
          title="Engagement by department"
          subtitle="(1) Assessment started   (2) Action plan completed"
          insight="No team is the lowest-engaged department — 0% have begun."
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cohortByDept}>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="dept" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisDataTick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
                cursor={{ fill: 'rgba(212,190,148,0.08)' }}
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    completed: 'Completed action plan',
                    started: 'Started assessment',
                    total: 'Total members',
                  };
                  return [value as number, labels[String(name)] ?? String(name)];
                }}
              />
              <Legend
                wrapperStyle={legendStyle}
                iconType="circle"
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    completed: 'Completed action plan',
                    started: 'Started assessment',
                    total: 'Total members',
                  };
                  return labels[value] ?? value;
                }}
              />
              <Bar dataKey="completed" fill={LRColors.gold}         radius={[4, 4, 0, 0]} />
              <Bar dataKey="started"   fill={LRColors.steel}        radius={[4, 4, 0, 0]} />
              <Bar dataKey="total"     fill={LRColors.lavenderDust} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ═══ ACTION ITEMS + LMS TOPICS — two cards side-by-side ═══ */}
        <section className="grid md:grid-cols-2 gap-5">
          {/* Action items */}
          <div
            className="rounded-[14px] p-7"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
              Action items
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1 mb-6">
              Total completed
            </h3>

            <div className="text-center mb-5">
              <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-6xl leading-none mb-2">
                {actionItems.total.toLocaleString()}
              </p>
              <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase text-(--lr-lavender-dust)">
                across {actionItems.members} members
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <Stat label="Avg / member" value={String(actionItems.avgPerMember)} />
              <Stat label="This week"    value={String(actionItems.thisWeek)}    delta={`+${actionItems.thisWeek}`} />
              <Stat label="This month"   value={String(actionItems.thisMonth)}   delta={`+${actionItems.thisMonth}`} />
            </div>

            <p className="text-xs text-(--lr-lavender-dust) mt-5 leading-relaxed">
              <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase mr-2 text-(--lr-gold)">
                Action items
              </span>
              Concrete tasks taken across the four domains.
            </p>
          </div>

          {/* LMS lessons */}
          <div
            className="rounded-[14px] p-7"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-baseline justify-between mb-1">
              <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
                LMS lessons
              </p>
              <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-2xl leading-none">
                {lmsTotal.toLocaleString()}
              </p>
            </div>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1 mb-5">
              Completed across 6 topics
            </h3>

            <div className="space-y-3">
              {lmsTopics.map((t) => {
                const widthPct = (t.completions / lmsTopics[0].completions) * 100;
                return (
                  <div key={t.topic}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="font-(family-name:--font-jura) text-[0.62rem] tracking-[0.18em] uppercase text-(--lr-pearl)">
                        {t.topic}
                      </span>
                      <span className="font-(family-name:--font-jetbrains) text-xs text-(--lr-gold) whitespace-nowrap">
                        {t.completions}
                        <span className="text-(--lr-lavender-dust) ml-2">{t.members} members</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(212,190,148,0.12)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${widthPct}%`, background: 'var(--lr-gold)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-(--lr-lavender-dust) mt-5 leading-relaxed">
              <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase mr-2 text-(--lr-gold)">
                Each topic
              </span>
              one section of the Legacy Readiness LMS.
            </p>
          </div>
        </section>

        {/* ═══ AVG READINESS — by department, per domain ═══ */}
        <ChartCard
          eyebrow="Domain × department"
          title="Avg readiness — by department, per domain"
          insight="HR leads on Legal · Finance leads on Financial · Engineering leads on Digital · HR leads on Physical."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={deptDomainReadiness}>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="dept" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisDataTick} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
                cursor={{ fill: 'rgba(212,190,148,0.08)' }}
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    legal:     '01 Legal',
                    financial: '02 Financial',
                    digital:   '03 Digital',
                    physical:  '04 Physical',
                  };
                  return [`${value}%`, labels[String(name)] ?? String(name)];
                }}
              />
              <Legend
                wrapperStyle={legendStyle}
                iconType="circle"
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    legal:     '01 Legal',
                    financial: '02 Financial',
                    digital:   '03 Digital',
                    physical:  '04 Physical',
                  };
                  return labels[value] ?? value;
                }}
              />
              <Bar dataKey="legal"     fill={LRColors.gold}         radius={[3, 3, 0, 0]} />
              <Bar dataKey="financial" fill="#C9A876"               radius={[3, 3, 0, 0]} />
              <Bar dataKey="digital"   fill={LRColors.steel}        radius={[3, 3, 0, 0]} />
              <Bar dataKey="physical"  fill={LRColors.lavenderDust} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ═══ WEEKLY ENGAGEMENT TRAJECTORY — line chart ═══ */}
        <ChartCard
          eyebrow="Engagement"
          title="Weekly engagement trajectory"
          insight="Active members up 195% over four weeks. Completions are tracking with the engagement curve."
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyEngagement}>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisDataTick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    active: 'Active members',
                    completed: 'Completions',
                  };
                  return [value as number, labels[String(name)] ?? String(name)];
                }}
              />
              <Legend
                wrapperStyle={legendStyle}
                iconType="line"
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    active: 'Active members',
                    completed: 'Completions',
                  };
                  return labels[value] ?? value;
                }}
              />
              <Line type="monotone" dataKey="active"    stroke={LRColors.gold}  strokeWidth={2} dot={{ fill: LRColors.gold,  r: 4 }} />
              <Line type="monotone" dataKey="completed" stroke={LRColors.steel} strokeWidth={2} dot={{ fill: LRColors.steel, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ═══ THE FUNNEL — kept simplified, the strategic narrative chart ═══ */}
        <section
          className="rounded-[14px] p-7"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            The journey
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1 mb-2">
            Where do members fall off?
          </h3>
          <p className="text-xs text-(--lr-lavender-dust) mb-6 leading-relaxed">
            Every step is the path from invitation to FinalPlaybook. The biggest drop-off tells you where to invest.
          </p>

          <div className="space-y-2.5">
            {funnel.map((stage, i) => {
              const widthPct = (stage.count / funnel[0].count) * 100;
              const fromPrev = i === 0 ? null : stage.count - funnel[i - 1].count;
              const dropPct = i === 0 ? null : Math.round((1 - stage.count / funnel[i - 1].count) * 100);
              const isBiggestDrop = (() => {
                if (i === 0) return false;
                let maxDrop = 0;
                let maxIdx = -1;
                for (let j = 1; j < funnel.length; j++) {
                  const drop = funnel[j - 1].count - funnel[j].count;
                  if (drop > maxDrop) { maxDrop = drop; maxIdx = j; }
                }
                return i === maxIdx;
              })();

              return (
                <div key={stage.label}>
                  <div className="flex items-baseline justify-between mb-1.5 gap-3">
                    <p className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.18em] uppercase text-(--lr-pearl)">
                      {stage.label}
                    </p>
                    <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm whitespace-nowrap">
                      {stage.count}
                      <span className="text-(--lr-lavender-dust) text-xs ml-2">
                        ({Math.round((stage.count / funnel[0].count) * 100)}%)
                      </span>
                    </p>
                  </div>
                  <div className="w-full h-7 rounded-[6px] overflow-hidden relative" style={{ background: 'rgba(212,190,148,0.08)' }}>
                    <div
                      className="h-full rounded-[6px] transition-all duration-700 flex items-center justify-end pr-3"
                      style={{
                        width: `${widthPct}%`,
                        background: isBiggestDrop
                          ? 'linear-gradient(90deg, rgba(166,84,84,0.6) 0%, rgba(166,84,84,0.85) 100%)'
                          : 'linear-gradient(90deg, var(--lr-gold-soft) 0%, var(--lr-gold) 100%)',
                      }}
                    >
                      {fromPrev !== null && (
                        <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: 'var(--lr-navy-deep)' }}>
                          {fromPrev > 0 ? `+${fromPrev}` : `${fromPrev}`} · {dropPct! > 0 ? `−${dropPct}%` : `+${Math.abs(dropPct!)}%`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="lr-separator my-5" />
          <p className="text-sm text-(--lr-pearl) opacity-90 leading-relaxed">
            <span className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase mr-2 text-(--lr-gold)">
              What this means
            </span>
            The biggest drop is between <span className="text-(--lr-gold)">Completed Action Plan → FinalPlaybook</span> —
            38% of starters finish their plan, but only 24% reach Playbook. A nudge program at week 3 could close this gap fastest.
          </p>
        </section>

        {/* ═══ REPORTS ═══ */}
        <section
          className="rounded-[14px] p-7"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
            Generate report
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-2">
            Pick a template
          </h3>
          <p className="text-xs text-(--lr-lavender-dust) mb-5 leading-relaxed">
            Reports run on aggregate data only — never individual answers or content.
          </p>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {REPORT_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleGenerateReport(tmpl.id)}
                className="text-left rounded-[12px] p-5 transition-all hover:-translate-y-0.5"
                style={{
                  background: 'rgba(212,190,148,0.04)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-base tracking-[0.05em] mb-1.5">
                  {tmpl.label}
                </p>
                <p className="text-xs text-(--lr-pearl) opacity-85 leading-relaxed mb-3">{tmpl.desc}</p>
                <span className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase text-(--lr-gold)">
                  Generate →
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ═══ MOST ACTIVE — kept for Cigna demo ═══ */}
        <section
          className="rounded-[14px] p-6"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Most active
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1 mb-2">
            Members closest to LEGACY_READY
          </h3>
          <p className="text-xs text-(--lr-lavender-dust) mb-4">
            Names visible only because you administer this tenant. Their reflections and answers stay private.
          </p>

          <div className="space-y-2">
            {topPerformers.map((emp, i) => (
              <div
                key={emp.id}
                className="flex items-center gap-4 px-4 py-3 rounded-[10px]"
                style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center font-(family-name:--font-jetbrains) text-sm flex-shrink-0"
                  style={{ background: 'rgba(212,190,148,0.12)', color: 'var(--lr-gold)', border: '1px solid var(--border-gold)' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-(--lr-pearl) truncate">{emp.name}</p>
                  <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
                    {emp.dept}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-base">
                    {emp.completed}/{emp.total}
                  </p>
                  <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust)">
                    {Math.round((emp.completed / emp.total) * 100)}% complete
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

/* ──────────── primitives ──────────── */

function ChartCard({
  eyebrow,
  title,
  subtitle,
  insight,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  insight: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] p-6"
      style={{
        background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="mb-5">
        <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
          {eyebrow}
        </p>
        <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1">
          {title}
        </h3>
        {subtitle && (
          <p className="font-(family-name:--font-jura) text-[0.62rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust) mt-1.5">
            {subtitle}
          </p>
        )}
      </div>
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

function OutcomeCard({
  eyebrow,
  primary,
  label,
  sub,
  accent,
}: {
  eyebrow: string;
  primary: string;
  label: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-[14px] p-6"
      style={{
        background: accent
          ? 'linear-gradient(180deg, rgba(212,190,148,0.16) 0%, rgba(212,190,148,0.06) 100%)'
          : 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
        border: accent ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
      }}
    >
      <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
        {eyebrow}
      </p>
      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-3xl leading-none mb-2">
        {primary}
      </p>
      <p className="font-(family-name:--font-italiana) text-(--lr-pearl) text-lg tracking-[0.04em] mb-2">
        {label}
      </p>
      <p className="text-xs text-(--lr-lavender-dust) leading-relaxed">{sub}</p>
    </div>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="text-center">
      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-xl leading-none">{value}</p>
      <p className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.22em] uppercase text-(--lr-lavender-dust) mt-1.5">
        {label}
      </p>
      {delta && (
        <p className="font-(family-name:--font-jetbrains) text-[0.6rem] text-(--lr-gold-soft) mt-0.5">{delta}</p>
      )}
    </div>
  );
}

function ExportOption({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <p className="text-sm text-(--lr-pearl)">{label}</p>
      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
        {hint}
      </p>
    </button>
  );
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
