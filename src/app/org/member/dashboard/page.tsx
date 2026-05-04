'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LRMonogram from '@/components/common/LRMonogram';

type Band = 'AT_RISK' | 'STARTING' | 'PREPARED' | 'PROTECTED' | 'LEGACY_READY';
type Level = 1 | 2 | 3 | 4;
type DomainStatus = 'complete' | 'active' | 'available' | 'locked';

interface Domain {
  id: string;
  number: string;
  label: string;
  description: string;
  pct: number;
  status: DomainStatus;
  unitDone: number;
  unitTotal: number;
  nextAction: string;
}

interface PersonaState {
  band: Band;
  bandLabel: string;
  bandBlurb: string;
  score: number;          // 0-1000 per Q40 engine
  xp: number;
  streak: number;
  level: Level;            // current playable level
  levelLabel: string;
  dayOfPath: number;
  badges: number;
  levels: Array<{ level: Level; label: string; pct: number; unlocked: boolean }>;
  scenarios: { D: number; T: number; LTC: number };
  nextActions: Array<{ taskId: string; name: string; level: Level; priority: string; minutes: number; domain: string }>;
}

/**
 * Per-persona experience derived from progressPercentage. Surfaces the
 * Q40 engine concepts (band, score/1000, L1-L4, 3-scenario readiness) so
 * the demo shows three distinct "levels of user" — AT_RISK, STARTING,
 * PROTECTED — without needing the live engine.
 */
function deriveState(progress: number): PersonaState {
  if (progress >= 70) {
    return {
      band: 'PROTECTED',
      bandLabel: 'Protected',
      bandBlurb: 'Your legal and digital scaffolding hold. The FinalPlaybook is within reach.',
      score: 812,
      xp: 1840,
      streak: 11,
      level: 3,
      levelLabel: 'Custodian',
      dayOfPath: 41,
      badges: 7,
      levels: [
        { level: 1, label: 'Foundation',      pct: 100, unlocked: true  },
        { level: 2, label: 'Core Protection', pct: 92,  unlocked: true  },
        { level: 3, label: 'Stewardship',     pct: 64,  unlocked: true  },
        { level: 4, label: 'Legacy',          pct: 0,   unlocked: false },
      ],
      scenarios: { D: 88, T: 71, LTC: 54 },
      nextActions: [
        { taskId: 'T22', name: 'Beneficiary review · IRA + 401k', level: 2, priority: 'Critical',  minutes: 8,  domain: 'Financial' },
        { taskId: 'T31', name: 'Password vault inheritance plan', level: 2, priority: 'High',      minutes: 12, domain: 'Digital'   },
        { taskId: 'T38', name: 'Ceremony preferences — first pass', level: 3, priority: 'High',    minutes: 15, domain: 'Physical'  },
        { taskId: 'T41', name: 'Communicate plan to executor',     level: 3, priority: 'Critical', minutes: 20, domain: 'Communication' },
        { taskId: 'T55', name: 'Annual document review',           level: 3, priority: 'Medium',   minutes: 10, domain: 'Legal'     },
      ],
    };
  }
  if (progress >= 25) {
    return {
      band: 'STARTING',
      bandLabel: 'Starting',
      bandBlurb: "You're past the threshold. Each lesson now strengthens what's already begun.",
      score: 364,
      xp: 720,
      streak: 4,
      level: 1,
      levelLabel: 'Steward',
      dayOfPath: 18,
      badges: 3,
      levels: [
        { level: 1, label: 'Foundation',      pct: 64, unlocked: true  },
        { level: 2, label: 'Core Protection', pct: 0,  unlocked: false },
        { level: 3, label: 'Stewardship',     pct: 0,  unlocked: false },
        { level: 4, label: 'Legacy',          pct: 0,  unlocked: false },
      ],
      scenarios: { D: 41, T: 32, LTC: 18 },
      nextActions: [
        { taskId: 'T16', name: 'Last Will and Testament',           level: 1, priority: 'StartHere', minutes: 25, domain: 'Legal'     },
        { taskId: 'T03', name: 'Healthcare proxy & living will',    level: 1, priority: 'StartHere', minutes: 18, domain: 'Legal'     },
        { taskId: 'T11', name: 'Digital legacy directive',          level: 1, priority: 'StartHere', minutes: 12, domain: 'Digital'   },
        { taskId: 'T19', name: 'Map your financial accounts',       level: 1, priority: 'Critical',  minutes: 10, domain: 'Financial' },
        { taskId: 'T05', name: 'Identify your legacy team',         level: 1, priority: 'Critical',  minutes: 15, domain: 'Communication' },
      ],
    };
  }
  return {
    band: 'AT_RISK',
    bandLabel: 'Day One',
    bandBlurb: 'Begin where it matters most. The first lesson takes only a few minutes.',
    score: 0,
    xp: 0,
    streak: 0,
    level: 1,
    levelLabel: 'Beginner',
    dayOfPath: 1,
    badges: 0,
    levels: [
      { level: 1, label: 'Foundation',      pct: 0, unlocked: true  },
      { level: 2, label: 'Core Protection', pct: 0, unlocked: false },
      { level: 3, label: 'Stewardship',     pct: 0, unlocked: false },
      { level: 4, label: 'Legacy',          pct: 0, unlocked: false },
    ],
    scenarios: { D: 0, T: 0, LTC: 0 },
    nextActions: [
      { taskId: 'T01', name: 'Welcome to MFP — orientation video', level: 1, priority: 'StartHere', minutes: 6,  domain: 'Beliefs' },
      { taskId: 'T16', name: 'Last Will and Testament',            level: 1, priority: 'StartHere', minutes: 25, domain: 'Legal'   },
      { taskId: 'T03', name: 'Healthcare proxy & living will',     level: 1, priority: 'StartHere', minutes: 18, domain: 'Legal'   },
    ],
  };
}

function buildPath(progress: number): Domain[] {
  if (progress >= 70) {
    return [
      { id: 'legal',     number: '01', label: 'LEGAL',     description: 'Will, power of attorney, healthcare directive', pct: 100, status: 'complete', unitDone: 6, unitTotal: 6, nextAction: 'Domain complete · Review your FinalPlaybook' },
      { id: 'financial', number: '02', label: 'FINANCIAL', description: 'Accounts, beneficiaries, ongoing obligations',  pct: 92,  status: 'active',   unitDone: 5, unitTotal: 6, nextAction: 'Beneficiary review · 8 min' },
      { id: 'digital',   number: '03', label: 'DIGITAL',   description: 'Logins, devices, online identity, social',     pct: 70,  status: 'active',   unitDone: 4, unitTotal: 6, nextAction: 'Password vault checklist · 12 min' },
      { id: 'physical',  number: '04', label: 'PHYSICAL',  description: 'Belongings, ceremony preferences, location',    pct: 50,  status: 'available', unitDone: 2, unitTotal: 4, nextAction: 'Begin ceremony preferences' },
    ];
  }
  if (progress >= 25) {
    return [
      { id: 'legal',     number: '01', label: 'LEGAL',     description: 'Will, power of attorney, healthcare directive', pct: 80, status: 'active',   unitDone: 5, unitTotal: 6, nextAction: 'Plan your will · video + action' },
      { id: 'financial', number: '02', label: 'FINANCIAL', description: 'Accounts, beneficiaries, ongoing obligations',  pct: 35, status: 'active',   unitDone: 2, unitTotal: 6, nextAction: 'Map your accounts · 10 min' },
      { id: 'digital',   number: '03', label: 'DIGITAL',   description: 'Logins, devices, online identity, social',     pct: 15, status: 'available', unitDone: 1, unitTotal: 6, nextAction: 'Begin your digital inventory' },
      { id: 'physical',  number: '04', label: 'PHYSICAL',  description: 'Belongings, ceremony preferences, location',    pct: 0,  status: 'locked',    unitDone: 0, unitTotal: 4, nextAction: 'Unlocks at 50% Financial' },
    ];
  }
  return [
    { id: 'legal',     number: '01', label: 'LEGAL',     description: 'Will, power of attorney, healthcare directive', pct: 0, status: 'available', unitDone: 0, unitTotal: 6, nextAction: 'Start here · "Welcome to MFP"' },
    { id: 'financial', number: '02', label: 'FINANCIAL', description: 'Accounts, beneficiaries, ongoing obligations',  pct: 0, status: 'locked',    unitDone: 0, unitTotal: 6, nextAction: 'Unlocks after Legal foundation' },
    { id: 'digital',   number: '03', label: 'DIGITAL',   description: 'Logins, devices, online identity, social',     pct: 0, status: 'locked',    unitDone: 0, unitTotal: 6, nextAction: 'Unlocks after Legal foundation' },
    { id: 'physical',  number: '04', label: 'PHYSICAL',  description: 'Belongings, ceremony preferences, location',    pct: 0, status: 'locked',    unitDone: 0, unitTotal: 4, nextAction: 'Unlocks after Financial begins' },
  ];
}

const BAND_PALETTE: Record<Band, { ring: string; tint: string }> = {
  AT_RISK:      { ring: 'var(--lr-lavender-dust)', tint: 'rgba(180,175,195,0.15)' },
  STARTING:     { ring: 'var(--lr-gold-pale)',     tint: 'rgba(228,215,185,0.18)' },
  PREPARED:     { ring: 'var(--lr-gold-soft)',     tint: 'rgba(195,172,128,0.18)' },
  PROTECTED:    { ring: 'var(--lr-gold)',          tint: 'rgba(212,190,148,0.20)' },
  LEGACY_READY: { ring: 'var(--lr-gold)',          tint: 'rgba(212,190,148,0.30)' },
};

/** Concentric ring progress dial with score/1000 in the center. */
function ScoreDial({ score, band, size = 220 }: { score: number; band: Band; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 1000) * c;
  const pal = BAND_PALETTE[band];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={size / 2} cy={size / 2} r={r + 4} fill="none" stroke="var(--lr-steel)" strokeOpacity="0.25" strokeWidth="0.5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(212,190,148,0.16)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={pal.ring}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <circle cx={size / 2} cy={size / 2} r={r - 11} fill="none" stroke="var(--lr-gold)" strokeOpacity="0.16" strokeWidth="0.5" />

      <text x="50%" y="42%" textAnchor="middle" fill="var(--lr-pearl)" fontFamily="var(--font-jura)" fontSize={size * 0.06} letterSpacing="0.22em">
        READINESS SCORE
      </text>
      <text x="50%" y="56%" textAnchor="middle" fill="var(--lr-gold)" fontFamily="var(--font-mono)" fontSize={size * 0.22}>
        {score}
      </text>
      <text x="50%" y="68%" textAnchor="middle" fill="var(--lr-lavender-dust)" fontFamily="var(--font-mono)" fontSize={size * 0.08}>
        / 1000
      </text>
    </svg>
  );
}

/** Smaller domain dial (used in the four-domain grid). */
function DomainDial({ pct, status, size = 140 }: { pct: number; status: DomainStatus; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const fill =
    status === 'complete' ? 'var(--lr-gold)' :
    status === 'active'   ? 'var(--lr-gold)' :
    status === 'available'? 'var(--lr-gold-pale)' :
                            'var(--lr-steel)';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={size / 2} cy={size / 2} r={r + 2} fill="none" stroke="var(--lr-steel)" strokeOpacity="0.3" strokeWidth="0.6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(212,190,148,0.18)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={fill}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <circle cx={size / 2} cy={size / 2} r={r - 9} fill="none" stroke="var(--lr-gold)" strokeOpacity="0.18" strokeWidth="0.6" />
      <text x="50%" y="48%" textAnchor="middle" fill="var(--lr-gold)" fontFamily="var(--font-mono)" fontSize={size * 0.22} dominantBaseline="middle">
        {pct}%
      </text>
      <text x="50%" y="66%" textAnchor="middle" fill="var(--lr-lavender-dust)" fontFamily="var(--font-jura)" fontSize={size * 0.085} letterSpacing="0.2em">
        {status.toUpperCase()}
      </text>
    </svg>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const employee = mockEmployees.find((e) => e.id === user?.id);
  const progress = employee?.progressPercentage ?? 0;

  const state = deriveState(progress);
  const path = buildPath(progress);
  const nextDomain = path.find((d) => d.status === 'active') ?? path.find((d) => d.status === 'available');

  const goToLesson = (id: string) => router.push(`/org/member/modules/${id}`);

  return (
    <DashboardLayout title="Your Legacy Path" role="org_member">
      {/* Hero — band + score + gamified stats */}
      <section
        className="relative overflow-hidden rounded-[18px] mb-8 px-8 py-9"
        style={{
          background: 'linear-gradient(135deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 opacity-20">
          <LRMonogram size={320} />
        </div>

        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="inline-block px-3 py-1 rounded-full font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase"
                style={{
                  background: BAND_PALETTE[state.band].tint,
                  color: BAND_PALETTE[state.band].ring,
                  border: `1px solid ${BAND_PALETTE[state.band].ring}`,
                }}
              >
                {state.bandLabel}
              </span>
              <span className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-lavender-dust)">
                Day {state.dayOfPath} of your path
              </span>
            </div>

            <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-4xl tracking-[0.06em] leading-tight">
              Welcome back, {user?.firstName}.
            </h2>
            <p className="text-(--lr-pearl) mt-3 max-w-md leading-relaxed opacity-90">
              {state.bandBlurb}
            </p>

            <div className="grid grid-cols-4 gap-3 mt-7">
              <Stat label="XP" value={state.xp.toLocaleString()} />
              <Stat label="Streak" value={`${state.streak}d`} icon="◆" />
              <Stat label="Level" value={`L${state.level}`} sub={state.levelLabel} />
              <Stat label="Badges" value={String(state.badges)} />
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <ScoreDial score={state.score} band={state.band} size={220} />
          </div>
        </div>
      </section>

      {/* Continue / Start banner */}
      {nextDomain && (
        <section
          className="rounded-[14px] mb-8 px-7 py-5 flex items-center justify-between gap-6 flex-wrap"
          style={{
            background: 'linear-gradient(180deg, rgba(212,190,148,0.16) 0%, rgba(212,190,148,0.05) 100%)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <div className="min-w-0">
            <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
              Today's lesson
            </p>
            <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mt-1">
              {nextDomain.number} {nextDomain.label} — {nextDomain.nextAction}
            </p>
          </div>
          <button onClick={() => goToLesson(nextDomain.id)} className="lr-btn-primary whitespace-nowrap">
            Resume →
          </button>
        </section>
      )}

      {/* Four-domain Legacy Path */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
              The four domains
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mt-1">
              Choose where to go next
            </h3>
          </div>
          <button onClick={() => router.push('/org/member/path')} className="lr-btn-outline" style={{ color: 'var(--lr-gold)' }}>
            Open immersive path →
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {path.map((d) => {
            const locked = d.status === 'locked';
            return (
              <button
                key={d.id}
                onClick={() => !locked && goToLesson(d.id)}
                disabled={locked}
                className="group text-left rounded-[14px] p-6 transition-all duration-300 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                  border: locked ? '1px solid rgba(212,190,148,0.1)' : '1px solid var(--border-gold)',
                  opacity: locked ? 0.55 : 1,
                  boxShadow: locked ? 'none' : '0 14px 38px -28px rgba(212,190,148,0.4)',
                }}
              >
                <div className="flex justify-center mb-5">
                  <DomainDial pct={d.pct} status={d.status} size={140} />
                </div>

                <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.28em] uppercase mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                  {d.number}
                </p>
                <p className="font-(family-name:--font-italiana) text-2xl text-(--lr-gold) tracking-[0.08em] mb-2">
                  {d.label}
                </p>
                <p className="text-xs text-(--lr-pearl) leading-relaxed opacity-80 mb-4 min-h-[3em]">
                  {d.description}
                </p>

                <hr className="lr-separator mb-4" />

                <div className="flex items-center justify-between text-xs">
                  <span className="font-(family-name:--font-jetbrains) text-(--lr-pearl)">
                    {d.unitDone}/{d.unitTotal} lessons
                  </span>
                  <span
                    className="font-(family-name:--font-jura) tracking-[0.18em] uppercase text-[0.62rem]"
                    style={{
                      color:
                        d.status === 'complete' || d.status === 'active'
                          ? 'var(--lr-gold)'
                          : d.status === 'available'
                          ? 'var(--lr-pearl)'
                          : 'var(--lr-lavender-dust)',
                    }}
                  >
                    {d.status === 'complete' ? '✓ Complete' : d.status === 'active' ? 'In progress' : d.status === 'available' ? 'Available' : 'Locked'}
                  </span>
                </div>

                <p className="text-[0.7rem] text-(--lr-gold-soft) mt-3 leading-relaxed">{d.nextAction}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Levels + Scenarios */}
      <section className="grid lg:grid-cols-2 gap-5 mb-10">
        {/* Level progression */}
        <div
          className="rounded-[14px] p-6"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
            Levels
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-5">
            Foundation → Legacy
          </h3>

          <div className="space-y-3">
            {state.levels.map((lvl) => (
              <div
                key={lvl.level}
                className="rounded-[10px] p-4 flex items-center gap-4"
                style={{
                  background: lvl.unlocked ? 'rgba(212,190,148,0.06)' : 'rgba(212,190,148,0.02)',
                  border: lvl.unlocked ? '1px solid rgba(212,190,148,0.18)' : '1px solid rgba(212,190,148,0.08)',
                  opacity: lvl.unlocked ? 1 : 0.55,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-(family-name:--font-jura) text-sm tracking-wider flex-shrink-0"
                  style={{
                    background: lvl.unlocked ? 'var(--lr-gold)' : 'rgba(212,190,148,0.1)',
                    color: lvl.unlocked ? 'var(--lr-navy-deep)' : 'var(--lr-lavender-dust)',
                    border: '1px solid var(--lr-gold)',
                  }}
                >
                  L{lvl.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-(family-name:--font-jura) text-sm tracking-[0.12em] uppercase text-(--lr-pearl)">
                      {lvl.label}
                    </p>
                    <span className="font-(family-name:--font-jetbrains) text-xs text-(--lr-gold)">
                      {lvl.pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(212,190,148,0.12)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${lvl.pct}%`, background: lvl.unlocked ? 'var(--lr-gold)' : 'transparent' }}
                    />
                  </div>
                  {!lvl.unlocked && (
                    <p className="text-[0.65rem] text-(--lr-lavender-dust) mt-1.5">
                      Unlocks at {lvl.level === 2 ? '100%' : '80%'} of L{lvl.level - 1}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario readiness */}
        <div
          className="rounded-[14px] p-6"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
            Three-scenario readiness
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-5">
            How prepared are you, by scenario?
          </h3>

          <div className="space-y-5">
            <ScenarioBar
              label="If I died tomorrow"
              code="D"
              pct={state.scenarios.D}
              hint="Will, executor, immediate-access info"
            />
            <ScenarioBar
              label="If I had a terminal diagnosis"
              code="T"
              pct={state.scenarios.T}
              hint="Healthcare directive, communication, financial runway"
            />
            <ScenarioBar
              label="If I needed long-term care"
              code="LTC"
              pct={state.scenarios.LTC}
              hint="Power of attorney, care preferences, asset protection"
            />
          </div>

          <hr className="lr-separator my-5" />

          <p className="text-xs text-(--lr-lavender-dust) leading-relaxed">
            These scenarios run alongside the four domains. Each lesson you complete strengthens one or
            more scenarios. Your weakest scenario tells you where to focus next.
          </p>
        </div>
      </section>

      {/* Next 5 actions */}
      <section
        className="rounded-[14px] p-6 mb-10"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
              Your next five
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mt-1">
              Recommended actions
            </h3>
          </div>
          <p className="text-xs text-(--lr-lavender-dust) hidden md:block">
            Ranked by priority, weakest domain, and what unlocks next.
          </p>
        </div>

        {state.nextActions.length === 0 ? (
          <p className="text-sm text-(--lr-pearl) opacity-80">
            No outstanding actions. Your FinalPlaybook is complete.
          </p>
        ) : (
          <div className="space-y-2">
            {state.nextActions.map((a, idx) => (
              <button
                key={a.taskId}
                onClick={() => router.push(`/org/member/modules/${a.domain.toLowerCase()}`)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-[10px] text-left transition-all hover:bg-white/[0.03]"
                style={{ border: '1px solid transparent' }}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center font-(family-name:--font-jetbrains) text-sm flex-shrink-0"
                  style={{
                    background: 'rgba(212,190,148,0.08)',
                    color: 'var(--lr-gold)',
                    border: '1px solid var(--border-gold)',
                  }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-(--lr-pearl) font-(family-name:--font-instrument)">
                    {a.name}
                  </p>
                  <p className="text-[0.65rem] tracking-[0.18em] uppercase font-(family-name:--font-jura) mt-0.5" style={{ color: 'var(--lr-gold-soft)' }}>
                    L{a.level} · {a.priority} · {a.domain} · ~{a.minutes} min
                  </p>
                </div>
                <span className="text-(--lr-gold) text-lg flex-shrink-0">→</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Achievements + streak */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lr-card p-6 lg:col-span-2">
          <p className="lr-eyebrow mb-3" style={{ color: 'var(--lr-gold-soft)' }}>
            Recently earned
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-4">
            Your milestones
          </h3>

          {state.badges > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'First Step',     sub: 'Welcome to MFP'  },
                { label: 'Foundation',     sub: 'Legal cleared'   },
                { label: 'Streak · 7',     sub: 'A week of care'  },
                { label: 'Custodian',      sub: 'Reached level 3' },
              ].slice(0, Math.min(4, state.badges)).map((b) => (
                <div
                  key={b.label}
                  className="rounded-[10px] p-4 text-center"
                  style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid rgba(212,190,148,0.22)' }}
                >
                  <div className="flex justify-center mb-2 opacity-90">
                    <LRMonogram size={36} />
                  </div>
                  <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-sm tracking-[0.05em]">
                    {b.label}
                  </p>
                  <p className="text-[0.65rem] text-(--lr-lavender-dust) mt-1">{b.sub}</p>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-[10px] p-6 text-center"
              style={{ background: 'rgba(212,190,148,0.05)', border: '1px solid rgba(212,190,148,0.15)' }}
            >
              <p className="text-sm text-(--lr-pearl) mb-2">Your first badge is one lesson away.</p>
              <p className="text-xs text-(--lr-lavender-dust)">
                Complete "Welcome to MFP" to earn your <span className="text-(--lr-gold)">First Step</span> badge.
              </p>
            </div>
          )}
        </div>

        <div
          className="rounded-[14px] p-6"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <p className="lr-eyebrow mb-3" style={{ color: 'var(--lr-gold-soft)' }}>
            Daily checkpoint
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-3">
            Keep your streak
          </h3>

          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {Array.from({ length: 7 }).map((_, i) => {
              const filled = i < Math.min(7, state.streak);
              return (
                <div
                  key={i}
                  className="h-9 rounded-md flex items-center justify-center text-xs font-(family-name:--font-jetbrains)"
                  style={{
                    background: filled ? 'var(--lr-gold)' : 'rgba(212,190,148,0.08)',
                    color: filled ? 'var(--lr-navy-deep)' : 'var(--lr-lavender-dust)',
                    border: filled ? '1px solid var(--lr-gold)' : '1px solid rgba(212,190,148,0.18)',
                  }}
                >
                  {filled ? '◆' : '·'}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-(--lr-pearl) leading-relaxed mb-5 opacity-90">
            {state.streak >= 7
              ? 'A full week. The path holds you now.'
              : state.streak > 0
              ? `${7 - state.streak} more day${7 - state.streak === 1 ? '' : 's'} earns the Week One badge.`
              : 'Begin a lesson today to start your streak.'}
          </p>

          <button onClick={() => nextDomain && goToLesson(nextDomain.id)} className="lr-btn-primary w-full">
            {progress > 0 ? 'Continue today' : 'Take first lesson'}
          </button>
        </div>
      </section>
    </DashboardLayout>
  );
}

function Stat({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: string }) {
  return (
    <div
      className="rounded-[10px] px-3 py-3 text-center"
      style={{ background: 'rgba(212,190,148,0.07)', border: '1px solid rgba(212,190,148,0.22)' }}
    >
      <p className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </p>
      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-xl">
        {icon && <span className="mr-1 text-base">{icon}</span>}
        {value}
      </p>
      {sub && <p className="text-[0.6rem] text-(--lr-lavender-dust) mt-1">{sub}</p>}
    </div>
  );
}

function ScenarioBar({ label, code, pct, hint }: { label: string; code: string; pct: number; hint: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: 'rgba(212,190,148,0.08)', color: 'var(--lr-gold)', border: '1px solid var(--border-gold)' }}
          >
            {code}
          </span>
          <span className="text-sm text-(--lr-pearl) truncate">{label}</span>
        </div>
        <span className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm flex-shrink-0">
          {pct}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: 'rgba(212,190,148,0.12)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'var(--lr-gold)' }} />
      </div>
      <p className="text-[0.65rem] text-(--lr-lavender-dust) mt-1.5">{hint}</p>
    </div>
  );
}
