'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import LRMonogram from '@/components/common/LRMonogram';

type NodeStatus = 'complete' | 'current' | 'available' | 'locked';
type StageId =
  | 'assessment'
  | 'build'
  | 'legal'
  | 'financial'
  | 'physical'
  | 'digital'
  | 'communication'
  | 'playbook';

interface PathStage {
  id: StageId;
  number: string;
  title: string;
  subtitle: string;
  body: string;
  actionCount: number;
  status: NodeStatus;
  /** Where the node routes when clicked (or a toast key for stages without a screen yet). */
  route?: string;
  /** True for the final celebratory node — rendered larger with a special crown. */
  isCapstone?: boolean;
}

/**
 * The Legacy Path is an eight-stage progression. Members move from intake
 * (40-question assessment) through six action-item domains to the Final
 * Playbook. Each persona unlocks stages based on their `progressPercentage`.
 *
 * Order is locked per product spec (April 2026, Niki):
 *   00 Assessment  →  01 Build Project  →  02 Legal  →  03 Financial  →
 *   04 Physical    →  05 Digital        →  06 Communication  →  FinalPlaybook
 */
function buildStages(progress: number): PathStage[] {
  // Threshold pattern: each stage requires the prior to clear.
  const status = (lower: number, upper: number): NodeStatus => {
    if (progress >= upper) return 'complete';
    if (progress >= lower) return 'current';
    if (progress >= lower - 6) return 'available';
    return 'locked';
  };

  return [
    {
      id: 'assessment',
      number: '00',
      title: '40-QUESTION ASSESSMENT',
      subtitle: 'Begin here · 8–12 minutes',
      body: 'Score your readiness across six life domains. Generates your personalised action plan.',
      actionCount: 40,
      status: status(0, 8),
      route: '/org/member/assessment',
    },
    {
      id: 'build',
      number: '01',
      title: 'BUILD MY PROJECT',
      subtitle: 'Action item · ~10 min',
      body: 'Set your goals, scenario focus, and stakeholders. Foundation for the six domains ahead.',
      actionCount: 1,
      status: status(8, 22),
      route: '/org/member/modules/build',
    },
    {
      id: 'legal',
      number: '02',
      title: 'START LEGAL',
      subtitle: 'Will, executor, healthcare proxy',
      body: 'Action items for the documents that protect those you love.',
      actionCount: 5,
      status: status(22, 38),
      route: '/org/member/modules/legal',
    },
    {
      id: 'financial',
      number: '03',
      title: 'FINANCIAL',
      subtitle: 'Accounts, beneficiaries, obligations',
      body: 'Map the financial picture your loved ones will need.',
      actionCount: 6,
      status: status(38, 58),
      route: '/org/member/modules/financial',
    },
    {
      id: 'physical',
      number: '04',
      title: 'PHYSICAL',
      subtitle: 'Belongings, ceremony, location',
      body: 'Honour the physical space of your life with intention.',
      actionCount: 4,
      status: status(58, 72),
      route: '/org/member/modules/physical',
    },
    {
      id: 'digital',
      number: '05',
      title: 'DIGITAL',
      subtitle: 'Logins, devices, online identity',
      body: 'The identity that lives only online — until it doesn\'t.',
      actionCount: 6,
      status: status(72, 86),
      route: '/org/member/modules/digital',
    },
    {
      id: 'communication',
      number: '06',
      title: 'COMMUNICATION',
      subtitle: 'Conversations, letters, instructions',
      body: 'The conversations that matter — and how to make them now.',
      actionCount: 5,
      status: status(86, 100),
      route: '/org/member/modules/communication',
    },
    {
      id: 'playbook',
      number: '★',
      title: 'GET MY FINAL PLAYBOOK',
      subtitle: 'Your compiled legacy',
      body: 'A single, dignified document your loved ones will reach for. Yours alone.',
      actionCount: 0,
      status: progress >= 100 ? 'available' : 'locked',
      route: '/org/member/certificates',
      isCapstone: true,
    },
  ];
}

const STAGE_PALETTE: Record<NodeStatus, { ring: string; glow: string; text: string }> = {
  complete:  { ring: 'var(--lr-gold)',      glow: '0 8px 22px -10px rgba(212,190,148,0.55)', text: 'var(--lr-gold)'      },
  current:   { ring: 'var(--lr-gold)',      glow: '0 0 32px -4px rgba(212,190,148,0.6)',      text: 'var(--lr-gold)'      },
  available: { ring: 'var(--lr-gold-pale)', glow: 'none',                                      text: 'var(--lr-pearl)'     },
  locked:    { ring: 'rgba(212,190,148,0.2)', glow: 'none',                                    text: 'var(--lr-lavender-dust)' },
};

export default function LegacyPathTree() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const employee = mockEmployees.find((e) => e.id === user?.id);
  const progress = employee?.progressPercentage ?? 0;
  const stages = buildStages(progress);

  // ---- snake winding layout ----
  const COL_WIDTH = 540;
  const CENTER_X = COL_WIDTH / 2;
  const AMPLITUDE = 150;
  const ROW_GAP = 200;
  const PADDING_TOP = 80;

  const positions = stages.map((s, i) => {
    const t = i / Math.max(stages.length - 1, 1);
    const wave = Math.sin(t * Math.PI * 2) * AMPLITUDE;
    return {
      x: CENTER_X + wave,
      y: PADDING_TOP + i * ROW_GAP,
      stage: s,
    };
  });

  const totalHeight = PADDING_TOP * 2 + (stages.length - 1) * ROW_GAP;

  // Single curve through all node centres
  const fullCurve = positions.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = positions[i - 1];
    const midY = (prev.y + p.y) / 2;
    return `${acc} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
  }, '');

  // Curve up to the first non-complete node — drawn solid gold
  const firstIncomplete = positions.findIndex((p) => p.stage.status !== 'complete');
  const completedCurveSegments = firstIncomplete > 0 ? positions.slice(0, firstIncomplete + 1) : positions.slice(0, 1);
  const completedCurve = completedCurveSegments.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = positions[i - 1];
    const midY = (prev.y + p.y) / 2;
    return `${acc} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
  }, '');

  const stats =
    progress >= 70
      ? { xp: 1840, streak: 11, level: 'L3 · Custodian', dailyXP: 60, dailyGoal: 80 }
      : progress >= 25
      ? { xp: 720,  streak: 4,  level: 'L1 · Steward',   dailyXP: 30, dailyGoal: 80 }
      : { xp: 0,    streak: 0,  level: 'L1 · Beginner',  dailyXP: 0,  dailyGoal: 80 };

  const handleStageClick = (s: PathStage) => {
    if (s.status === 'locked') {
      toast(`Locked — finish "${stages[stages.findIndex((x) => x.id === s.id) - 1]?.title ?? 'previous stage'}" to unlock`, 'warn');
      return;
    }
    if (s.route) router.push(s.route);
  };

  return (
    <DashboardLayout title="Legacy Path · Immersive" role="org_member">
      {/* Hero strip */}
      <section
        className="rounded-[14px] mb-7 px-6 py-5 flex items-center justify-between flex-wrap gap-4"
        style={{
          background: 'linear-gradient(135deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            The path · 8 stages
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mt-1">
            Climb at your own pace, {user?.firstName}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-3 min-w-fit">
          <Mini label="XP" value={stats.xp.toLocaleString()} />
          <Mini label="Streak" value={`${stats.streak}d`} />
          <Mini label="Level" value={stats.level} />
        </div>
      </section>

      {/* Two-column: tree + side rail */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* PATH TREE */}
        <div
          className="rounded-[14px] p-6 overflow-x-auto"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(42,58,98,0.55) 0%, var(--lr-midnight) 70%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
            Your journey
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-4">
            From assessment to FinalPlaybook
          </h3>

          <div className="relative mx-auto" style={{ width: COL_WIDTH, height: totalHeight }}>
            {/* Connecting curve */}
            <svg
              width={COL_WIDTH}
              height={totalHeight}
              viewBox={`0 0 ${COL_WIDTH} ${totalHeight}`}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Background full path — dashed pearl */}
              <path
                d={fullCurve}
                fill="none"
                stroke="rgba(212,190,148,0.18)"
                strokeWidth="3"
                strokeDasharray="6 8"
                strokeLinecap="round"
              />
              {/* Completed portion — solid gold */}
              <path
                d={completedCurve}
                fill="none"
                stroke="var(--lr-gold)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* Stage nodes positioned absolutely along the curve */}
            {positions.map(({ x, y, stage }) => {
              const size = stage.isCapstone ? 130 : 110;
              const pal = STAGE_PALETTE[stage.status];
              const isCurrent = stage.status === 'current';
              const isComplete = stage.status === 'complete';
              const isLocked = stage.status === 'locked';
              const isAvailable = stage.status === 'available';

              return (
                <div
                  key={stage.id}
                  className="absolute"
                  style={{
                    left: x - size / 2,
                    top: y - size / 2,
                    width: size,
                    height: size,
                  }}
                >
                  {/* Pulsing ring for current node */}
                  {isCurrent && (
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        animation: 'lr-pulse 2.2s ease-out infinite',
                        border: '2px solid var(--lr-gold)',
                      }}
                    />
                  )}

                  <button
                    onClick={() => handleStageClick(stage)}
                    disabled={isLocked}
                    className="w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                    style={{
                      background: isComplete
                        ? 'var(--lr-gold)'
                        : 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                      border: `2px solid ${pal.ring}`,
                      boxShadow: pal.glow,
                      opacity: isLocked ? 0.55 : 1,
                    }}
                  >
                    {stage.isCapstone ? (
                      <LRMonogram size={Math.round(size * 0.55)} />
                    ) : isComplete ? (
                      <>
                        <span className="font-(family-name:--font-jetbrains) text-(--lr-navy-deep) text-2xl leading-none">
                          ✓
                        </span>
                        <span className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.22em] uppercase text-(--lr-navy-deep) mt-1.5 opacity-80">
                          {stage.number}
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase mb-1"
                          style={{ color: 'var(--lr-gold-soft)' }}
                        >
                          Stage {stage.number}
                        </span>
                        <span
                          className="font-(family-name:--font-jetbrains) text-2xl"
                          style={{ color: pal.text }}
                        >
                          {stage.actionCount > 0 ? stage.actionCount : '◆'}
                        </span>
                        {stage.actionCount > 0 && (
                          <span
                            className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.18em] uppercase mt-1"
                            style={{ color: 'var(--lr-lavender-dust)' }}
                          >
                            {stage.id === 'assessment' ? 'questions' : 'actions'}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Stage label below the node */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none"
                    style={{ top: size + 8 }}
                  >
                    <p
                      className="font-(family-name:--font-italiana) tracking-[0.06em]"
                      style={{
                        fontSize: stage.isCapstone ? '1.1rem' : '0.85rem',
                        color: isComplete || isCurrent
                          ? 'var(--lr-gold)'
                          : isLocked
                          ? 'var(--lr-lavender-dust)'
                          : 'var(--lr-pearl)',
                      }}
                    >
                      {stage.title}
                    </p>
                    <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-1">
                      {stage.subtitle}
                    </p>
                    {isCurrent && (
                      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase text-(--lr-gold) mt-1.5">
                        ▼ {stage.id === 'assessment' ? 'Begin' : isAvailable || isCurrent ? 'Continue' : 'Start'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <style jsx>{`
            @keyframes lr-pulse {
              0%   { transform: scale(1);   opacity: 0.7; }
              70%  { transform: scale(1.4); opacity: 0;   }
              100% { transform: scale(1.4); opacity: 0;   }
            }
          `}</style>
        </div>

        {/* SIDE RAIL */}
        <aside className="space-y-4">
          {/* Today's Threshold */}
          <div
            className="rounded-[14px] p-5"
            style={{
              background: 'linear-gradient(180deg, rgba(212,190,148,0.16) 0%, rgba(212,190,148,0.05) 100%)',
              border: '1px solid var(--border-gold)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              Today's threshold
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-lg tracking-[0.05em] mb-3">
              Earn {stats.dailyGoal} XP today
            </h3>

            <div className="flex items-baseline justify-between mb-2">
              <span className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm">
                {stats.dailyXP} / {stats.dailyGoal} XP
              </span>
              <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust)">
                {Math.round((stats.dailyXP / stats.dailyGoal) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: 'rgba(212,190,148,0.12)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (stats.dailyXP / stats.dailyGoal) * 100)}%`, background: 'var(--lr-gold)' }} />
            </div>

            <div className="mt-4 space-y-2">
              <Quest done={stats.dailyXP >= 30}  label="Earn first 30 XP" />
              <Quest done={stats.dailyXP >= 80}  label="Complete one action" />
              <Quest done={false}                label="Open one reflection" />
            </div>
          </div>

          {/* Streak Shield */}
          <div
            className="rounded-[14px] p-5"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              Streak shield
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-lg tracking-[0.05em] mb-3">
              {stats.streak}-day streak
            </h3>

            <div className="grid grid-cols-7 gap-1 mb-3">
              {Array.from({ length: 7 }).map((_, i) => {
                const filled = i < Math.min(7, stats.streak);
                return (
                  <div
                    key={i}
                    className="h-7 rounded-md flex items-center justify-center"
                    style={{
                      background: filled ? 'var(--lr-gold)' : 'rgba(212,190,148,0.08)',
                      color: filled ? 'var(--lr-navy-deep)' : 'var(--lr-lavender-dust)',
                      border: filled ? '1px solid var(--lr-gold)' : '1px solid rgba(212,190,148,0.18)',
                    }}
                  >
                    <span className="text-[0.6rem] font-(family-name:--font-jetbrains)">{filled ? '◆' : '·'}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => toast('Streak Shield armed — protects one missed day', 'success')}
              className="w-full lr-btn-outline"
              style={{ color: 'var(--lr-gold)' }}
            >
              Arm shield (1 available)
            </button>
          </div>

          {/* Cohort Circle */}
          <div
            className="rounded-[14px] p-5"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              Cohort circle
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-lg tracking-[0.05em] mb-3">
              Practising this week
            </h3>

            <div className="flex items-center mb-3">
              {['SM', 'MR', 'AP', 'JC', 'DK'].map((init, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-(family-name:--font-jura) text-[0.6rem] tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-midnight) 100%)',
                    color: 'var(--lr-gold)',
                    border: '1px solid var(--lr-gold)',
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: 5 - i,
                  }}
                >
                  {init}
                </div>
              ))}
              <div
                className="ml-2 px-2 py-0.5 rounded-full font-(family-name:--font-jetbrains) text-xs"
                style={{ background: 'rgba(212,190,148,0.08)', color: 'var(--lr-pearl)', border: '1px solid var(--border-gold)' }}
              >
                +9
              </div>
            </div>

            <p className="text-xs text-(--lr-pearl) opacity-85 leading-relaxed">
              <span className="text-(--lr-gold)">14 colleagues</span> at XYZ Company are practising this week.
              No names ranked. No content shared.
            </p>
          </div>

          {/* Letter Vault */}
          <div
            className="rounded-[14px] p-5"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              The letter vault
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-lg tracking-[0.05em] mb-3">
              Sealed letters
            </h3>

            <div className="space-y-2">
              {[
                { who: 'To my executor',  unlocked: progress >= 38, hint: 'Unlocks after Legal' },
                { who: 'To my partner',   unlocked: progress >= 58, hint: 'Unlocks after Financial' },
                { who: 'To my children',  unlocked: progress >= 86, hint: 'Unlocks after Digital' },
                { who: 'To future me',    unlocked: progress >= 100, hint: 'Unlocks at FinalPlaybook' },
              ].map((l) => (
                <button
                  key={l.who}
                  onClick={() =>
                    l.unlocked
                      ? toast(`Opening "${l.who}" letter — coming next`, 'info')
                      : toast(l.hint, 'warn')
                  }
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-left transition-colors hover:bg-white/[0.03]"
                  style={{
                    border: '1px solid rgba(212,190,148,0.12)',
                    opacity: l.unlocked ? 1 : 0.55,
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{
                      background: l.unlocked ? 'rgba(212,190,148,0.12)' : 'rgba(212,190,148,0.04)',
                      color: l.unlocked ? 'var(--lr-gold)' : 'var(--lr-lavender-dust)',
                      border: l.unlocked ? '1px solid var(--lr-gold)' : '1px dashed rgba(212,190,148,0.2)',
                    }}
                  >
                    {l.unlocked ? '✉' : '◆'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-(--lr-pearl)">{l.who}</p>
                    <p className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
                      {l.unlocked ? 'Available' : l.hint}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[10px] px-3 py-2 text-center"
      style={{ background: 'rgba(212,190,148,0.08)', border: '1px solid var(--border-gold)' }}
    >
      <p className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.22em] uppercase mb-0.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </p>
      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm whitespace-nowrap">{value}</p>
    </div>
  );
}

function Quest({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] flex-shrink-0"
        style={{
          background: done ? 'var(--lr-gold)' : 'rgba(212,190,148,0.08)',
          color: done ? 'var(--lr-navy-deep)' : 'var(--lr-lavender-dust)',
          border: done ? '1px solid var(--lr-gold)' : '1px solid rgba(212,190,148,0.2)',
        }}
      >
        {done ? '✓' : '·'}
      </span>
      <span className="text-xs text-(--lr-pearl) opacity-90">{label}</span>
    </div>
  );
}
