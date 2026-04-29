'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import LRMonogram from '@/components/common/LRMonogram';

type NodeStatus = 'complete' | 'current' | 'available' | 'locked';
type NodeKind = 'lesson' | 'milestone' | 'capstone';

interface PathNode {
  id: string;
  kind: NodeKind;
  domain?: 'legal' | 'financial' | 'digital' | 'physical';
  title: string;
  duration?: string;
  xp: number;
  status: NodeStatus;
  /** Anchor link target — opens the corresponding lesson page. */
  href?: string;
}

/**
 * Returns a ~12-node Legacy Path appropriate for the persona's progression.
 * Each domain is bracketed by a milestone anchor so the visual reads like
 * "open Legal → 4 lessons → close Legal → open Financial → ..."
 */
function buildPath(progress: number): PathNode[] {
  const cap = (n: number) => Math.max(0, Math.min(progress, n));
  const sLegal     = cap(95);
  const sFinancial = cap(70);
  const sDigital   = cap(45);
  const sPhysical  = cap(20);

  const status = (rangeStart: number, rangeEnd: number, persona: number): NodeStatus => {
    if (persona >= rangeEnd) return 'complete';
    if (persona >= rangeStart) return 'current';
    if (persona >= rangeStart - 8) return 'available';
    return 'locked';
  };

  return [
    { id: 'm-legal',  kind: 'milestone', domain: 'legal',     title: '01  LEGAL',     xp: 0,  status: progress > 0 ? 'complete' : 'current', href: '/employee/modules/legal' },
    { id: 'l1', kind: 'lesson', domain: 'legal',  title: 'Legal Language',         duration: '12 min', xp: 80,  status: status(0,   25,  sLegal),     href: '/employee/modules/legal' },
    { id: 'l2', kind: 'lesson', domain: 'legal',  title: 'Legacy Team Roles',      duration: '10 min', xp: 80,  status: status(25,  50,  sLegal),     href: '/employee/modules/legal' },
    { id: 'l3', kind: 'lesson', domain: 'legal',  title: 'Plan Your Will',         duration: '15 min', xp: 100, status: status(50,  75,  sLegal),     href: '/employee/modules/legal' },
    { id: 'l4', kind: 'lesson', domain: 'legal',  title: 'Healthcare Proxy',       duration: '8 min',  xp: 80,  status: status(75,  100, sLegal),     href: '/employee/modules/legal' },

    { id: 'm-financial', kind: 'milestone', domain: 'financial', title: '02  FINANCIAL', xp: 0, status: progress >= 70 ? 'complete' : progress >= 25 ? 'current' : 'locked', href: '/employee/modules/financial' },
    { id: 'f1', kind: 'lesson', domain: 'financial', title: 'Map Your Accounts',    duration: '10 min', xp: 80,  status: status(0,  35, sFinancial), href: '/employee/modules/financial' },
    { id: 'f2', kind: 'lesson', domain: 'financial', title: 'Beneficiary Review',   duration: '8 min',  xp: 80,  status: status(35, 70, sFinancial), href: '/employee/modules/financial' },

    { id: 'm-digital',  kind: 'milestone', domain: 'digital',  title: '03  DIGITAL',   xp: 0, status: progress >= 70 ? 'current' : 'locked', href: '/employee/modules/digital' },
    { id: 'd1', kind: 'lesson', domain: 'digital', title: 'Three-Scenario Approach', duration: '8 min',  xp: 80, status: status(0, 45, sDigital), href: '/employee/modules/digital' },

    { id: 'm-physical', kind: 'milestone', domain: 'physical', title: '04  PHYSICAL',  xp: 0, status: progress >= 90 ? 'available' : 'locked', href: '/employee/modules/physical' },

    { id: 'capstone', kind: 'capstone', title: 'FINAL PLAYBOOK', xp: 500, status: progress >= 100 ? 'available' : 'locked', href: '/employee/certificates' },
  ];
}

export default function LegacyPathTree() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const employee = mockEmployees.find((e) => e.id === user?.id);
  const progress = employee?.progressPercentage ?? 0;
  const nodes = buildPath(progress);

  // ---- layout math: snake winding pattern ----
  // Vertical column, alternating left / centre / right offset. Each node
  // spaces by ROW_GAP. Milestones are larger so they get extra room.
  const COL_WIDTH = 480;     // path width (px)
  const CENTER_X  = COL_WIDTH / 2;
  const AMPLITUDE = 130;     // how far nodes drift left/right
  const ROW_GAP   = 110;
  const PADDING_TOP = 60;

  const positions = nodes.map((n, i) => {
    // Sine wave gives a smooth snake. Phase shift so it feels organic.
    const t = i / Math.max(nodes.length - 1, 1);
    const wave = Math.sin(t * Math.PI * 2.4) * AMPLITUDE;
    const x = CENTER_X + wave;
    const y = PADDING_TOP + i * ROW_GAP + (n.kind !== 'lesson' ? 14 : 0);
    return { x, y, node: n };
  });

  const totalHeight = PADDING_TOP * 2 + (nodes.length - 1) * ROW_GAP + 120;

  // Build the connecting curve as a single SVG path
  const curvePath = positions.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = positions[i - 1];
    const midY = (prev.y + p.y) / 2;
    return `${acc} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
  }, '');

  // Find the index of the first incomplete node — the curve up to that index
  // draws in solid gold; after that, dashed.
  const firstIncomplete = positions.findIndex((p) => p.node.status !== 'complete');
  const completedPath = (firstIncomplete > 0 ? positions.slice(0, firstIncomplete + 1) : positions.slice(0, 1))
    .reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = positions[i - 1];
      const midY = (prev.y + p.y) / 2;
      return `${acc} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
    }, '');

  const stats = progress >= 70
    ? { xp: 1840, streak: 11, level: 'L3 · Custodian', dailyXP: 60, dailyGoal: 80 }
    : progress >= 25
    ? { xp: 720,  streak: 4,  level: 'L1 · Steward',   dailyXP: 30, dailyGoal: 80 }
    : { xp: 0,    streak: 0,  level: 'L1 · Beginner',  dailyXP: 0,  dailyGoal: 80 };

  const handleNodeClick = (n: PathNode) => {
    if (n.status === 'locked') {
      toast(`Locked — finish the previous domain to unlock "${n.title}"`, 'warn');
      return;
    }
    if (n.href) router.push(n.href);
  };

  return (
    <DashboardLayout title="Legacy Path · Immersive" role="employee">
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
            The path
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
            background:
              'radial-gradient(ellipse at top, rgba(42,58,98,0.55) 0%, var(--lr-midnight) 70%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
            Your journey
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-4">
            Climb the Legacy Path
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
                d={curvePath}
                fill="none"
                stroke="rgba(212,190,148,0.18)"
                strokeWidth="3"
                strokeDasharray="6 8"
                strokeLinecap="round"
              />
              {/* Completed portion — solid gold */}
              <path
                d={completedPath}
                fill="none"
                stroke="var(--lr-gold)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* Node buttons positioned absolutely */}
            {positions.map(({ x, y, node }) => {
              const isMilestone = node.kind === 'milestone';
              const isCapstone = node.kind === 'capstone';
              const size = isCapstone ? 100 : isMilestone ? 84 : 64;
              const isCurrent = node.status === 'current';
              const isLocked = node.status === 'locked';
              const isComplete = node.status === 'complete';

              return (
                <div
                  key={node.id}
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
                    onClick={() => handleNodeClick(node)}
                    disabled={isLocked}
                    className="w-full h-full rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                    style={{
                      background: isComplete
                        ? 'var(--lr-gold)'
                        : isCurrent
                        ? 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)'
                        : isLocked
                        ? 'rgba(28,38,68,0.6)'
                        : 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                      border: isComplete
                        ? '2px solid var(--lr-gold)'
                        : isCurrent
                        ? '2px solid var(--lr-gold)'
                        : isLocked
                        ? '1px dashed rgba(212,190,148,0.18)'
                        : '2px solid var(--lr-gold-pale)',
                      boxShadow: isCurrent
                        ? '0 0 32px -4px rgba(212,190,148,0.55)'
                        : isComplete
                        ? '0 8px 18px -10px rgba(212,190,148,0.5)'
                        : 'none',
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    {isMilestone || isCapstone ? (
                      <LRMonogram size={isCapstone ? 56 : 46} />
                    ) : isComplete ? (
                      <span className="font-(family-name:--font-jetbrains) text-(--lr-navy-deep) text-lg">✓</span>
                    ) : isLocked ? (
                      <span className="text-(--lr-gold-soft) text-base">◆</span>
                    ) : (
                      <span className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm">
                        +{node.xp}
                      </span>
                    )}
                  </button>

                  {/* Node label */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none"
                    style={{ top: size + 6 }}
                  >
                    <p
                      className={`font-(family-name:--font-jura) text-[0.62rem] tracking-[0.18em] uppercase ${
                        isMilestone || isCapstone ? 'font-semibold' : ''
                      }`}
                      style={{
                        color: isComplete
                          ? 'var(--lr-gold)'
                          : isCurrent
                          ? 'var(--lr-gold)'
                          : isLocked
                          ? 'var(--lr-lavender-dust)'
                          : 'var(--lr-pearl)',
                      }}
                    >
                      {node.title}
                    </p>
                    {node.duration && (
                      <p className="font-(family-name:--font-jetbrains) text-[0.6rem] text-(--lr-lavender-dust) mt-0.5">
                        {node.duration}
                      </p>
                    )}
                    {isCurrent && (
                      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.2em] uppercase text-(--lr-gold) mt-1">
                        ▼ Start
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pulse keyframes */}
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
              <Quest done={stats.dailyXP >= 80}  label="Complete one lesson" />
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
                    background:
                      'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-midnight) 100%)',
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
              <span className="text-(--lr-gold)">14 colleagues</span> at XYZ Company are practising this week. No
              names ranked. No content shared.
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
                { who: 'To my executor',  unlocked: progress >= 50,  hint: 'Unlocks at Legal 50%' },
                { who: 'To my partner',   unlocked: progress >= 70,  hint: 'Unlocks at Financial complete' },
                { who: 'To my children',  unlocked: progress >= 85,  hint: 'Unlocks at Digital complete' },
                { who: 'To future me',    unlocked: progress >= 95,  hint: 'Unlocks at Physical complete' },
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
