'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees, mockProgress, mockModules } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { LRColors } from '@/lib/theme';
import { useToast } from '@/components/common/Toast';
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

type Range = 'weekly' | 'monthly';
type ExportFormat = 'txt' | 'csv';

export default function HRAnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [range, setRange] = useState<Range>('monthly');
  const [aiQuery, setAiQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  if (!user) return null;

  const orgEmployees = mockEmployees.filter((e) => e.organizationId === user.organizationId);
  const totalModules = mockModules.length;

  const completionData = [
    { name: 'Complete',    value: orgEmployees.filter((e) => e.progressPercentage === 100).length, color: LRColors.gold },
    { name: 'In progress', value: orgEmployees.filter((e) => e.progressPercentage > 0 && e.progressPercentage < 100).length, color: LRColors.steel },
    { name: 'Not started', value: orgEmployees.filter((e) => e.progressPercentage === 0).length, color: LRColors.lavenderDust },
  ];

  const departments = [...new Set(orgEmployees.map((e) => e.department))];
  const departmentData = departments.map((dept) => {
    const list = orgEmployees.filter((e) => e.department === dept);
    const avg = list.reduce((acc, emp) => acc + emp.progressPercentage, 0) / list.length;
    return { department: dept, readiness: Math.round(avg), members: list.length };
  });

  const moduleCompletionData = mockModules.map((m) => {
    const completedCount = mockProgress.filter((p) => p.moduleId === m.id && p.status === 'completed').length;
    return {
      module: m.title.length > 22 ? m.title.slice(0, 20) + '…' : m.title,
      fullTitle: m.title,
      rate: Math.round((completedCount / Math.max(orgEmployees.length, 1)) * 100),
      completions: completedCount,
    };
  });

  const assessmentDistribution = [
    { range: '0–3',       count: orgEmployees.filter((e) => e.assessmentScore !== null && e.assessmentScore <= 3).length },
    { range: '4–6',       count: orgEmployees.filter((e) => e.assessmentScore !== null && e.assessmentScore >= 4 && e.assessmentScore <= 6).length },
    { range: '7–10',      count: orgEmployees.filter((e) => e.assessmentScore !== null && e.assessmentScore >= 7).length },
    { range: 'Not taken', count: orgEmployees.filter((e) => e.assessmentScore === null).length },
  ];

  const weeklyEngagementData = [
    { week: 'W14', active: 1, completed: 0 },
    { week: 'W15', active: 2, completed: 0 },
    { week: 'W16', active: 3, completed: 1 },
    { week: 'W17', active: 4, completed: 1 },
  ];

  // Band distribution — synthesised from progressPercentage (folded in from Reports)
  const bandData = (() => {
    const bands = { AT_RISK: 0, STARTING: 0, PREPARED: 0, PROTECTED: 0, LEGACY_READY: 0 };
    orgEmployees.forEach((e) => {
      const pct = e.progressPercentage;
      if (pct >= 90) bands.LEGACY_READY++;
      else if (pct >= 70) bands.PROTECTED++;
      else if (pct >= 50) bands.PREPARED++;
      else if (pct >= 25) bands.STARTING++;
      else bands.AT_RISK++;
    });
    return [
      { band: 'AT_RISK',      label: 'At Risk',      count: bands.AT_RISK },
      { band: 'STARTING',     label: 'Starting',     count: bands.STARTING },
      { band: 'PREPARED',     label: 'Prepared',     count: bands.PREPARED },
      { band: 'PROTECTED',    label: 'Protected',    count: bands.PROTECTED },
      { band: 'LEGACY_READY', label: 'Legacy Ready', count: bands.LEGACY_READY },
    ];
  })();

  // Top performers (folded in from Reports)
  const topPerformers = orgEmployees
    .map((emp) => {
      const completed = mockProgress.find((p) => p.employeeId === emp.id)?.completedModules.length || 0;
      return { ...emp, completed, pct: Math.round((completed / Math.max(totalModules, 1)) * 100) };
    })
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

  const totalCompletions = mockProgress.reduce((acc, p) => acc + p.completedModules.length, 0);
  const avgCompletionPct = Math.round(
    (totalCompletions / Math.max(orgEmployees.length * totalModules, 1)) * 100
  );

  const handleExport = (format: ExportFormat) => {
    const today = new Date().toISOString().split('T')[0];
    setShowExportMenu(false);

    if (format === 'csv') {
      const rows = [
        ['Member', 'Department', 'Lessons completed', 'Total lessons', 'Completion %', 'Status'],
        ...orgEmployees.map((emp) => {
          const completed = mockProgress.find((p) => p.employeeId === emp.id)?.completedModules.length || 0;
          return [
            `${emp.firstName} ${emp.lastName}`,
            emp.department,
            String(completed),
            String(totalModules),
            String(Math.round((completed / totalModules) * 100)),
            emp.status,
          ];
        }),
      ];
      const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
      downloadBlob(csv, `cohort_readiness_${today}.csv`, 'text/csv');
      toast('CSV exported — aggregate metrics only', 'success');
      return;
    }

    const text = `═══════════════════════════════════════════════════
       COHORT READINESS REPORT — ${today.toUpperCase()}
   Legacy Readiness OS · Powered by Endevo
═══════════════════════════════════════════════════

Overview
  Members:            ${orgEmployees.length}
  Avg completion:     ${avgCompletionPct}%
  Total completions:  ${totalCompletions}
  Learning hours:     ${totalCompletions * 2.5}

Band distribution
${bandData.map((b) => `  ${b.label.padEnd(14)}  ${String(b.count).padStart(3)}`).join('\n')}

Department breakdown
${departmentData.map((d) => `  ${d.department.padEnd(22)}  ${d.members} members · ${d.readiness}% avg`).join('\n')}

Lesson completion rates
${moduleCompletionData.map((m) => `  ${m.fullTitle.padEnd(38)}  ${m.rate}% (${m.completions}/${orgEmployees.length})`).join('\n')}

═══════════════════════════════════════════════════
  This report contains aggregate metrics only.
  No member content, reflections, or PII included.
═══════════════════════════════════════════════════
`;
    downloadBlob(text, `cohort_readiness_${today}.txt`, 'text/plain');
    toast('Report exported — aggregate metrics only', 'success');
  };

  return (
    <DashboardLayout title="Analytics" role="org_admin">
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Cohort insight
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-3xl tracking-[0.06em] mt-1">
            Six views, one truth
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
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
              Export report ▾
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
                <ExportOption label="As spreadsheet (.csv)" hint="One row per member" onClick={() => handleExport('csv')} />
                <ExportOption
                  label="Schedule monthly"
                  hint="Email this on the 1st"
                  onClick={() => {
                    toast('Monthly report scheduled — first delivery May 1', 'success');
                    setShowExportMenu(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <ChartCard
          eyebrow="Cohort"
          title="Band distribution"
          insight={`${bandData.find((b) => b.count > 0)?.label ?? 'No members'} is your largest band. Send a quiet reminder from the dashboard to lift the AT_RISK group toward STARTING.`}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bandData}>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisDataTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(212,190,148,0.08)' }} />
              <Bar dataKey="count" fill={LRColors.gold} radius={[4, 4, 0, 0]} name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          eyebrow="Status"
          title="Completion overview"
          insight={`${completionData[0].value} of ${orgEmployees.length} members have completed all four domains.`}
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
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ fontFamily: 'var(--font-jura)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: LRColors.pearl }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          eyebrow="Department"
          title="Readiness by department"
          insight={`${[...departmentData].sort((a, b) => b.readiness - a.readiness)[0]?.department} leads at ${[...departmentData].sort((a, b) => b.readiness - a.readiness)[0]?.readiness}% average.`}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentData}>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="department" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisDataTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(212,190,148,0.08)' }} />
              <Bar dataKey="readiness" fill={LRColors.gold} radius={[4, 4, 0, 0]} name="Avg readiness %" />
              <Bar dataKey="members"   fill={LRColors.steel} radius={[4, 4, 0, 0]} name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          eyebrow="Modules"
          title="Lesson completion rates"
          insight="Foundational lessons see the highest completion. Engagement softens at the action-item stage."
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleCompletionData}>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="module" tick={axisTick} angle={-30} textAnchor="end" height={90} axisLine={false} tickLine={false} />
              <YAxis tick={axisDataTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(212,190,148,0.08)' }} />
              <Bar dataKey="rate" fill={LRColors.gold} radius={[4, 4, 0, 0]} name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          eyebrow="Assessment"
          title="Initial readiness score distribution"
          insight={`${assessmentDistribution[3].count} member${assessmentDistribution[3].count === 1 ? '' : 's'} haven't yet taken the assessment.`}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={assessmentDistribution}>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="range" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisDataTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(212,190,148,0.08)' }} />
              <Bar dataKey="count" fill={LRColors.gold} radius={[4, 4, 0, 0]} name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          eyebrow="Engagement"
          title="Weekly engagement trajectory"
          insight="Engagement is ramping. Active members and completions are both trending upward week over week."
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyEngagementData}>
              <CartesianGrid stroke="rgba(212,190,148,0.08)" vertical={false} />
              <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisDataTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ fontFamily: 'var(--font-jura)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: LRColors.pearl }}
                iconType="line"
              />
              <Line type="monotone" dataKey="active"    stroke={LRColors.gold}  strokeWidth={2} dot={{ fill: LRColors.gold, r: 4 }} name="Active members" />
              <Line type="monotone" dataKey="completed" stroke={LRColors.steel} strokeWidth={2} dot={{ fill: LRColors.steel, r: 4 }} name="Completions" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Ask AI panel */}
        <div
          className="rounded-[14px] p-6"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
            Ask Jesse
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-4">
            Custom analytics, in your own words
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiQuery.trim()) {
                  toast(`Drafting report for "${aiQuery.slice(0, 40)}${aiQuery.length > 40 ? '…' : ''}"`, 'success');
                  setAiQuery('');
                }
              }}
              placeholder="e.g. compare Caregiver Solutions vs Chronic Disease average readiness"
              className="flex-1 rounded-[10px] px-4 py-3 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold) transition-colors"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
            />
            <button
              onClick={() => {
                if (!aiQuery.trim()) {
                  toast('Type a question first — e.g. "compare departments by readiness"', 'warn');
                  return;
                }
                toast(`Drafting report for "${aiQuery.slice(0, 40)}${aiQuery.length > 40 ? '…' : ''}"`, 'success');
                setAiQuery('');
              }}
              className="lr-btn-primary whitespace-nowrap"
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-(--lr-lavender-dust) mt-3">
            Natural-language reports run on aggregate data only. Member-level content is never accessible.
          </p>
        </div>

        {/* Top performers — folded in from former Reports page */}
        <div
          className="rounded-[14px] p-6"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
                Most active
              </p>
              <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1">
                Members closest to LEGACY_READY
              </h3>
            </div>
          </div>
          <p className="text-xs text-(--lr-lavender-dust) mb-4">
            Names visible only because you administer this tenant. Their reflections and answers remain private to them.
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
                  <p className="text-sm text-(--lr-pearl) truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
                    {emp.department}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-base">
                    {emp.completed}/{totalModules}
                  </p>
                  <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust)">
                    {emp.pct}% complete
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
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

function ChartCard({
  eyebrow,
  title,
  insight,
  children,
}: {
  eyebrow: string;
  title: string;
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
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            {eyebrow}
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1">
            {title}
          </h3>
        </div>
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
