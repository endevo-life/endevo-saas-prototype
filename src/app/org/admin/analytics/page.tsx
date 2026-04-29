'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees, mockProgress, mockModules } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
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

export default function HRAnalyticsPage() {
  const { user } = useAuth();
  if (!user) return null;

  const orgEmployees = mockEmployees.filter((e) => e.organizationId === user.organizationId);

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
      rate: Math.round((completedCount / Math.max(orgEmployees.length, 1)) * 100),
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

  return (
    <DashboardLayout title="Analytics" role="hr_admin">
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Cohort insight
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-3xl tracking-[0.06em] mt-1">
            Six views, one truth
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="lr-btn-outline" style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}>Weekly</button>
          <button className="lr-btn-outline" style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}>Monthly</button>
          <button className="lr-btn-primary">Export PDF</button>
        </div>
      </div>

      <div className="space-y-5">
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
              placeholder="e.g. compare Caregiver Solutions vs Chronic Disease average readiness"
              className="flex-1 rounded-[10px] px-4 py-3 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold) transition-colors"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
            />
            <button className="lr-btn-primary whitespace-nowrap">Generate</button>
          </div>
          <p className="text-xs text-(--lr-lavender-dust) mt-3">
            Natural-language reports run on aggregate data only. Member-level content is never accessible.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
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
