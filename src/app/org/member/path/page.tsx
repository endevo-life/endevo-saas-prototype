'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import LRMonogram from '@/components/common/LRMonogram';
import { useEffect, useState } from 'react';
import { DOMAINS, type Resource } from '@/lib/module-content';

type NodeStatus = 'complete' | 'current' | 'available' | 'locked';

/**
 * Maps a path stage to the module domain key whose content powers the
 * slide-in panel. Stages without their own module library (assessment,
 * communication, the playbook capstone) return null and the panel shows a
 * graceful summary instead.
 */
const STAGE_TO_DOMAIN: Partial<Record<StageId, string>> = {
  build: 'build',
  legal: 'legal',
  financial: 'financial',
  physical: 'physical',
  digital: 'digital',
};
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
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [openStage, setOpenStage] = useState<PathStage | null>(null);
  const employee = mockEmployees.find((e) => e.id === user?.id);
  const progress = employee?.progressPercentage ?? 0;
  const stages = buildStages(progress);

  useEffect(() => {
    const readTheme = () => {
      const bodyTheme = document.body.getAttribute('data-theme');
      if (bodyTheme === 'light' || bodyTheme === 'dark') {
        setThemeMode(bodyTheme);
        return;
      }
      const saved = localStorage.getItem('lr_theme');
      setThemeMode(saved === 'light' ? 'light' : 'dark');
    };

    readTheme();
    const observer = new MutationObserver(readTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const isLight = themeMode === 'light';

  // ---- compact gamified zig-zag layout ----
  // Milestones flow left → right across the board, wrapping to a new row
  // when they run out of horizontal room. Within each row they alternate
  // up / down so the connecting line bounces — playful spatial rhythm
  // without the tall single-column scroll. Tone stays Eternal Geometry:
  // champagne gold, no penalty UI, no Duolingo brightness.
  const COL_WIDTH = 760;
  const PER_ROW = 3;            // nodes per horizontal row before wrapping
  const COL_GAP = COL_WIDTH / (PER_ROW + 1);
  const ROW_GAP = 215;          // vertical distance between wrapped rows
  const ZIG = 46;               // up/down bounce within a row
  const PADDING_TOP = 80;

  const positions = stages.map((s, i) => {
    const row = Math.floor(i / PER_ROW);
    const idxInRow = i % PER_ROW;
    // Snake direction: even rows go L→R, odd rows go R→L (boustrophedon)
    const leftToRight = row % 2 === 0;
    const col = leftToRight ? idxInRow : PER_ROW - 1 - idxInRow;
    const zig = idxInRow % 2 === 0 ? -ZIG : ZIG; // alternate bounce
    return {
      x: COL_GAP * (col + 1),
      y: PADDING_TOP + row * ROW_GAP + zig,
      stage: s,
    };
  });

  const rowCount = Math.ceil(stages.length / PER_ROW);
  const totalHeight = PADDING_TOP * 2 + (rowCount - 1) * ROW_GAP + ZIG * 2;

  // Smooth curve between two consecutive nodes. Same-row hops bend
  // horizontally (control points offset in X); row-wrap hops bend
  // vertically (control points offset in Y) so the line loops gently
  // down to the next row instead of cutting straight across.
  const segment = (
    prev: { x: number; y: number },
    p: { x: number; y: number },
    sameRow: boolean,
  ) => {
    if (sameRow) {
      const midX = (prev.x + p.x) / 2;
      return ` C ${midX} ${prev.y}, ${midX} ${p.y}, ${p.x} ${p.y}`;
    }
    const midY = (prev.y + p.y) / 2;
    return ` C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
  };

  const curveThrough = (pts: typeof positions) =>
    pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const sameRow = Math.floor((i - 1) / PER_ROW) === Math.floor(i / PER_ROW);
      return acc + segment(prev, p, sameRow);
    }, '');

  // Single curve through all node centres
  const fullCurve = curveThrough(positions);

  // Curve up to the first non-complete node — drawn solid gold
  const firstIncomplete = positions.findIndex((p) => p.stage.status !== 'complete');
  const completedCurveSegments =
    firstIncomplete > 0 ? positions.slice(0, firstIncomplete + 1) : positions.slice(0, 1);
  const completedCurve = curveThrough(completedCurveSegments);

  // Calm, factual metrics — no XP / streak / level gamification (death-prep
  // tone). Peace-of-mind score tracks readiness; counts come from stages.
  const peaceScore = Math.round(progress);
  const completedStages = stages.filter((s) => s.status === 'complete').length;
  const totalStages = stages.length;
  const milestonesTouched = Math.min(
    completedStages + (stages.some((s) => s.status === 'current') ? 1 : 0),
    totalStages,
  );

  const handleStageClick = (s: PathStage) => {
    if (s.status === 'locked') {
      toast(`Locked — finish "${stages[stages.findIndex((x) => x.id === s.id) - 1]?.title ?? 'previous stage'}" to unlock`, 'warn');
      return;
    }
    // Open the milestone content inline as a slide-in panel rather than
    // navigating away — the path stays "home" behind the panel.
    setOpenStage(s);
  };

  return (
    <DashboardLayout title="Legacy Path · Immersive" role="org_member">
      {/* Hero strip */}
      <section
        className="rounded-[14px] mb-7 px-6 py-5 flex items-center justify-between flex-wrap gap-4"
        style={{
          background: isLight
            ? 'linear-gradient(135deg, #FFFFFF 0%, #F7F3E9 100%)'
            : 'linear-gradient(135deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
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
          <Mini label="Peace of mind" value={`${peaceScore}`} />
          <Mini label="Completed" value={`${completedStages}/${totalStages}`} />
          <Mini label="Touched" value={`${milestonesTouched}`} />
        </div>
      </section>

      {/* Two-column: tree + side rail */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* PATH TREE */}
        <div
          className="rounded-[14px] p-6 overflow-x-auto"
          style={{
            background: isLight
              ? 'linear-gradient(180deg, #FFFFFF 0%, #F5F1E8 100%)'
              : 'radial-gradient(ellipse at top, rgba(42,58,98,0.55) 0%, var(--lr-midnight) 70%)',
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
              const size = stage.isCapstone ? 104 : 88;
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

                  {/* "You are here" pin — gamified wayfinding, calm tone */}
                  {isCurrent && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                      style={{ bottom: size + 6, animation: 'lr-float 2.6s ease-in-out infinite' }}
                    >
                      <span
                        className="px-2.5 py-1 rounded-full font-(family-name:--font-jura) text-[0.55rem] tracking-[0.2em] uppercase"
                        style={{
                          background: 'var(--lr-gold)',
                          color: 'var(--lr-navy-deep)',
                          boxShadow: '0 6px 16px -6px rgba(212,190,148,0.6)',
                        }}
                      >
                        You&apos;re here
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handleStageClick(stage)}
                    disabled={isLocked}
                    className="w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                    style={{
                      background: isComplete
                        ? 'var(--lr-gold)'
                        : isLight
                        ? 'linear-gradient(180deg, #FFFFFF 0%, #F3EEE2 100%)'
                        : 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                      border: `2px solid ${pal.ring}`,
                      boxShadow: pal.glow,
                      opacity: isLocked ? 0.55 : 1,
                    }}
                  >
                    {stage.isCapstone ? (
                      <LRMonogram size={Math.round(size * 0.55)} themeMode={themeMode} />
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
            @keyframes lr-float {
              0%, 100% { transform: translate(-50%, 0); }
              50%      { transform: translate(-50%, -4px); }
            }
          `}</style>
        </div>

        {/* SIDE RAIL — Peace of mind · Trusted advisor · This week */}
        <aside className="space-y-4">
          {/* Peace of mind score */}
          <div
            className="rounded-[14px] p-6 text-center"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-gold)',
            }}
          >
            <p className="lr-eyebrow mb-3" style={{ color: 'var(--lr-gold-soft)' }}>
              Peace of mind
            </p>
            <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-5xl leading-none">
              {peaceScore}
            </p>
            <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-lavender-dust) mt-2 mb-4">
              of 100
            </p>
            <div className="w-full h-2 rounded-full" style={{ background: 'rgba(212,190,148,0.12)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${peaceScore}%`, background: 'var(--lr-gold)' }}
              />
            </div>
          </div>

          {/* Trusted advisor */}
          <div
            className="rounded-[14px] p-5"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="lr-eyebrow mb-3" style={{ color: 'var(--lr-gold-soft)' }}>
              Trusted advisor
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-lg tracking-[0.05em] mb-2">
              Ask anything
            </h3>
            <p className="text-xs text-(--lr-pearl) opacity-85 leading-relaxed mb-4">
              Niki built guidance for when you&apos;re stuck or not sure what&apos;s next.
            </p>
            <button
              onClick={() => toast('Trusted Advisor connects in Phase 2', 'info')}
              className="w-full text-left px-4 py-2.5 rounded-[10px] text-sm transition-colors hover:bg-white/[0.03]"
              style={{
                background: 'rgba(212,190,148,0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--lr-lavender-dust)',
              }}
            >
              Ask a question…
            </button>
          </div>

          {/* This week */}
          <div
            className="rounded-[14px] p-5"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="lr-eyebrow mb-3" style={{ color: 'var(--lr-gold-soft)' }}>
              This week
            </p>
            <div
              className="rounded-[10px] px-4 py-3"
              style={{ background: 'rgba(212,190,148,0.05)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-lg tracking-[0.04em]">
                {milestonesTouched} milestone{milestonesTouched === 1 ? '' : 's'} touched
              </p>
              <p className="text-xs text-(--lr-lavender-dust) mt-1">
                No streak language. Just facts.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Slide-in milestone content panel */}
      <MilestonePanel
        stage={openStage}
        isLight={isLight}
        onClose={() => setOpenStage(null)}
        onOpenFull={(route) => {
          setOpenStage(null);
          router.push(route);
        }}
      />
    </DashboardLayout>
  );
}

/**
 * Slide-in content panel — opens when a path node is clicked. Mirrors the
 * L3 milestone view from UX_REDESIGN.md (video playlist + worksheet docker)
 * without leaving the path. The path dims behind it; closing returns there.
 *
 * Content is wired to the real module library (src/lib/module-content.ts):
 * the same lessons, sample Drive videos, and resources the full module page
 * uses. Stages without a module library show a graceful summary.
 */
function MilestonePanel({
  stage,
  isLight,
  onClose,
  onOpenFull,
}: {
  stage: PathStage | null;
  isLight: boolean;
  onClose: () => void;
  onOpenFull: (route: string) => void;
}) {
  const open = stage !== null;
  const domainKey = stage ? STAGE_TO_DOMAIN[stage.id] : undefined;
  const domain = domainKey ? DOMAINS[domainKey] : undefined;
  const lessons = domain?.lessons ?? [];

  // Which lesson is selected inside the panel. Reset to 0 when a new stage
  // opens — done during render (React's "adjust state on prop change" pattern)
  // rather than in an effect, so there's no cascading-render warning.
  const [activeIdx, setActiveIdx] = useState(0);
  const [seenStageId, setSeenStageId] = useState(stage?.id);
  if (stage?.id !== seenStageId) {
    setSeenStageId(stage?.id);
    setActiveIdx(0);
  }

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const lesson = lessons[activeIdx];
  const resources: Resource[] = lesson?.resources
    ? lesson.resources
    : lesson?.externalUrl
    ? [{ kind: 'tool', label: 'Open activity', url: lesson.externalUrl }]
    : [];

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(8,11,22,0.6)',
          backdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={stage?.title ?? 'Milestone'}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[720px] flex flex-col transition-transform duration-300 ease-out"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          background: isLight
            ? 'linear-gradient(180deg, #FFFFFF 0%, #F5F1E8 100%)'
            : 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          borderLeft: '1px solid var(--border-gold)',
          boxShadow: '-30px 0 60px -30px rgba(0,0,0,0.6)',
        }}
      >
        {stage && (
          <>
            {/* Header */}
            <div
              className="flex items-start justify-between gap-4 px-7 py-5 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="min-w-0">
                <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                  {domain ? `${domain.number} · ${domain.label}` : `Stage ${stage.number}`} · {stage.subtitle}
                </p>
                <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] leading-tight">
                  {stage.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-lg shrink-0 hover:bg-(--surface-elevated) transition-colors"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                <svg className="w-5 h-5 text-(--lr-gold)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Body — scrolls */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
              {domain && lesson ? (
                <>
                  {/* Active lesson title */}
                  <div>
                    <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                      Lesson {lesson.number} · {lesson.type} · {lesson.duration}
                    </p>
                    <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.04em]">
                      {lesson.title}
                    </h3>
                  </div>

                  {/* Real Drive video for this lesson */}
                  {lesson.driveId ? (
                    <div
                      className="relative w-full overflow-hidden rounded-[12px]"
                      style={{
                        paddingBottom: '56.25%',
                        background: 'var(--lr-midnight)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <iframe
                        src={`https://drive.google.com/file/d/${lesson.driveId}/preview`}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay"
                        allowFullScreen
                        title={lesson.title}
                      />
                    </div>
                  ) : (
                    <div
                      className="rounded-[12px] aspect-video flex items-center justify-center"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(42,58,98,0.6) 0%, var(--lr-midnight) 80%)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-lavender-dust)">
                        Worksheet-only lesson · no video
                      </p>
                    </div>
                  )}

                  {/* Lesson playlist — real lessons, click to switch */}
                  {lessons.length > 1 && (
                    <div>
                      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.2em] uppercase text-(--lr-gold-soft) mb-2">
                        {lessons.length} lessons · plays in order
                      </p>
                      <div className="space-y-1.5">
                        {lessons.map((l, i) => {
                          const isActive = i === activeIdx;
                          return (
                            <button
                              key={l.id}
                              onClick={() => setActiveIdx(i)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors"
                              style={{
                                background: isActive ? 'rgba(212,190,148,0.12)' : 'transparent',
                                border: isActive ? '1px solid var(--lr-gold)' : '1px solid var(--border-subtle)',
                              }}
                            >
                              <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-(family-name:--font-jetbrains)"
                                style={{
                                  background: isActive ? 'var(--lr-gold)' : 'rgba(212,190,148,0.08)',
                                  color: isActive ? 'var(--lr-navy-deep)' : 'var(--lr-gold)',
                                  border: '1px solid var(--lr-gold)',
                                }}
                              >
                                {isActive ? '▶' : i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-(--lr-pearl) truncate">{l.title}</p>
                                <p className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
                                  {l.type} · {l.duration}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Real resources for this lesson */}
                  {resources.length > 0 && (
                    <div
                      className="rounded-[12px] p-5"
                      style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
                    >
                      <p className="lr-eyebrow mb-3" style={{ color: 'var(--lr-gold)' }}>
                        {lesson.type === 'explore' ? 'Stories & resources' : lesson.type === 'action' ? 'Action item' : 'Resources'}
                      </p>
                      <div className="space-y-2">
                        {resources.map((r) => (
                          <a
                            key={r.url}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors hover:bg-white/[0.04] group"
                            style={{ background: 'rgba(28,38,68,0.55)', border: '1px solid var(--border-subtle)' }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-(--lr-pearl) truncate group-hover:text-(--lr-gold) transition-colors">
                                {r.label}
                              </p>
                              <p className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
                                {r.kind} · {r.hint ?? 'opens in new tab'}
                              </p>
                            </div>
                            <span className="text-(--lr-gold) flex-shrink-0">↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Takeaways for this lesson */}
                  {lesson.takeaways.length > 0 && (
                    <div>
                      <p className="lr-eyebrow mb-3" style={{ color: 'var(--lr-gold-soft)' }}>
                        Takeaways
                      </p>
                      <ul className="space-y-2.5">
                        {lesson.takeaways.map((t, i) => (
                          <li key={i} className="flex gap-3 text-sm text-(--lr-pearl) leading-relaxed">
                            <span className="text-(--lr-gold) mt-0.5 flex-shrink-0">◆</span>
                            <span className="opacity-90">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                /* Stages without a module library (assessment, communication, playbook) */
                <div className="space-y-4">
                  <p className="text-sm text-(--lr-pearl) opacity-90 leading-relaxed">{stage.body}</p>
                  <div
                    className="rounded-[12px] p-5"
                    style={{ background: 'rgba(212,190,148,0.05)', border: '1px solid var(--border-subtle)' }}
                  >
                    <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-gold-soft)">
                      {stage.id === 'assessment'
                        ? `${stage.actionCount} questions · opens full assessment`
                        : stage.isCapstone
                        ? 'Assembled once every domain is complete'
                        : 'Content for this stage is coming soon'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div
              className="flex items-center gap-3 px-7 py-4 flex-shrink-0"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <button
                onClick={() => stage.route && onOpenFull(stage.route)}
                className="lr-btn-primary flex-1"
                disabled={!stage.route}
              >
                {stage.status === 'complete' ? 'Review milestone' : 'Open full module'}
              </button>
              <button onClick={onClose} className="lr-btn-gold">
                Back to path
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[10px] px-3 py-2 text-center"
      style={{
        background: 'color-mix(in srgb, var(--lr-gold) 10%, transparent)',
        border: '1px solid var(--border-gold)',
      }}
    >
      <p className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.22em] uppercase mb-0.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </p>
      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm whitespace-nowrap">{value}</p>
    </div>
  );
}
