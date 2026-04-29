'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

interface Resource {
  kind: 'typeform' | 'tool' | 'podcast' | 'video';
  label: string;
  url: string;
  hint?: string;
}

interface Lesson {
  id: string;
  number: string;
  title: string;
  type: 'video' | 'reading' | 'action' | 'explore';
  duration: string;
  driveId?: string;
  /** Legacy single-link field — kept for backward compat with other domains. */
  externalUrl?: string;
  /** Richer multi-link field — preferred for new lessons. */
  resources?: Resource[];
  takeaways: string[];
}

interface DomainContent {
  number: string;
  label: string;
  description: string;
  totalLessons: number;
  startedLessons: number;
  xpPerLesson: number;
  lessons: Lesson[];
}

const DOMAINS: Record<string, DomainContent> = {
  legal: {
    number: '01',
    label: 'LEGAL',
    description: 'The language of estate, executor, beneficiary, will. The documents that protect those you love.',
    totalLessons: 5,
    startedLessons: 1,
    xpPerLesson: 80,
    lessons: [
      {
        id: 'legal-language',
        number: '01.01',
        title: 'Learn the Legal Language & Documents Needed',
        type: 'video',
        duration: '12 min',
        driveId: '1a6XM150jNTMHil0xNrOZJzxOadPIq4s6',
        takeaways: [
          'The four documents every adult should have',
          'How "executor", "trustee", and "beneficiary" differ',
          'When state law overrides intent — and how to prevent it',
        ],
      },
      {
        id: 'legal-goal-setting',
        number: '01.02',
        title: 'Action Item #1 · Project Goal Setting',
        type: 'action',
        duration: '8 min',
        driveId: '1_B3bBOZhEdRtAnLmIjgCNMQcoVyIpDy3',
        resources: [
          {
            kind: 'typeform',
            label: 'Open the goal-setting form',
            url: 'https://jbigogmrgex.typeform.com/to/WfLmFB8k',
            hint: 'Private to you · 5 minutes',
          },
        ],
        takeaways: [
          'Define what "ready" looks like for you',
          'Identify the one fear holding you back',
          'Set a 30-day legal milestone',
        ],
      },
      {
        id: 'legal-team',
        number: '01.03',
        title: 'Action Item #2 · Assign Roles for Your Legacy Team',
        type: 'action',
        duration: '10 min',
        driveId: '1ksCg6c0n_idjwtFUZf6w2CgdFZFS1Sj5',
        resources: [
          {
            kind: 'typeform',
            label: 'Map your legacy team',
            url: 'https://jbigogmrgex.typeform.com/to/pIgpXkq6',
            hint: 'Private to you · 6 minutes',
          },
        ],
        takeaways: [
          'Choose your executor (and a backup)',
          'Identify your healthcare proxy',
          'Document the people who matter — and how they connect',
        ],
      },
      {
        id: 'legal-will',
        number: '01.04',
        title: 'Action Item #3 · Plan Your Will',
        type: 'action',
        duration: '15 min',
        driveId: '1jcKfaFZUgBYH6Akhb3w4cDITO8NtcL9o',
        resources: [
          {
            kind: 'tool',
            label: 'Trust & Will',
            url: 'https://trustandwill.com/',
            hint: 'Attorney-supported, paid · ~$159',
          },
          {
            kind: 'tool',
            label: 'FreeWill',
            url: 'https://www.freewill.com/',
            hint: 'Free, self-guided · simple estates',
          },
        ],
        takeaways: [
          'DIY vs attorney-drafted — when each makes sense',
          'The three things even a simple will must include',
          'How to keep it current after life changes',
        ],
      },
      {
        id: 'legal-explore',
        number: '01.05',
        title: 'Explore · Stories & Resources',
        type: 'explore',
        duration: '20 min',
        driveId: '1xWSX8cJ0ZwfO-A-q1eJEjva977LHDD_r',
        resources: [
          {
            kind: 'video',
            label: 'Dying to Meet Joel',
            url: 'https://drive.google.com/file/d/1xWSX8cJ0ZwfO-A-q1eJEjva977LHDD_r/view',
            hint: 'Short film · loss & legacy',
          },
          {
            kind: 'podcast',
            label: 'Unclaimed Assets When You Die · Michael Zwick',
            url: 'https://youtu.be/lspuELMp6Pw',
            hint: 'Podcast · 28 min',
          },
          {
            kind: 'podcast',
            label: 'How to DIY Your Will or Trust · Cody Barbo',
            url: 'https://youtu.be/2YYbmQMHheQ',
            hint: 'Podcast · 32 min',
          },
        ],
        takeaways: [
          'Real stories from people who navigated loss without paperwork',
          'How unclaimed assets become a quiet inheritance problem',
          'When DIY tools fit — and when they don\'t',
        ],
      },
    ],
  },
  financial: {
    number: '02',
    label: 'FINANCIAL',
    description: 'Accounts, beneficiaries, recurring obligations. The financial map your loved ones will need.',
    totalLessons: 6,
    startedLessons: 0,
    xpPerLesson: 80,
    lessons: [
      {
        id: 'fin-welcome',
        number: '02.01',
        title: 'Welcome to MFP — Your Financial Foundation',
        type: 'video',
        duration: '6 min',
        driveId: '1DXtkIe6nhzxrHx5DgBn_kIxv07kK8c0L',
        takeaways: [
          'Why financial readiness sits beside legal — not under it',
          'The 12 accounts most adults forget to document',
          'How to begin without disclosing balances',
        ],
      },
      {
        id: 'fin-framework',
        number: '02.02',
        title: 'The Framework',
        type: 'video',
        duration: '9 min',
        driveId: '12dacJt6zS4g3te9iwZSDHZNUmvkLU5oC',
        takeaways: [
          'The four-domain readiness framework',
          'How to map dependencies across domains',
          'Where your weakest link likely lives',
        ],
      },
    ],
  },
  digital: {
    number: '03',
    label: 'DIGITAL',
    description: 'Logins, devices, photos, social presence. The identity that lives only online — until it doesn\'t.',
    totalLessons: 6,
    startedLessons: 0,
    xpPerLesson: 80,
    lessons: [
      {
        id: 'digital-scenarios',
        number: '03.01',
        title: 'Three-Scenario Approach',
        type: 'video',
        duration: '8 min',
        driveId: '1EljMxGatCdW6BmUP9OS53UYmHeSw_dVr',
        takeaways: [
          '"If I died tomorrow" — what becomes urgent',
          '"If I had a terminal diagnosis" — what changes',
          '"If I needed long-term care" — what others would need',
        ],
      },
    ],
  },
  physical: {
    number: '04',
    label: 'PHYSICAL',
    description: 'Belongings, ceremony preferences, the physical space of your life. Dignity in the details.',
    totalLessons: 5,
    startedLessons: 0,
    xpPerLesson: 80,
    lessons: [
      {
        id: 'physical-options',
        number: '04.01',
        title: 'Learn · Physical Options',
        type: 'video',
        duration: '14 min',
        driveId: '1ZORoacIa-qqajLTgl0Az93wcqwYszCWX',
        takeaways: [
          'The full menu of options most people never see',
          'How preferences differ from instructions — and why both matter',
          'Where your decisions intersect with your loved ones\' grief',
        ],
      },
      {
        id: 'physical-action-1',
        number: '04.02',
        title: 'Action Item #1 · Choose Your Direction',
        type: 'action',
        duration: '8 min',
        driveId: '1xfQyTejFhihbApOKYgfSiaNbBAnS6Hgh',
        takeaways: [
          'Decide between the major care pathways',
          'Capture the "why" behind your choice — for those who survive you',
          'Write the one sentence that orients everything else',
        ],
      },
      {
        id: 'physical-action-2',
        number: '04.03',
        title: 'Action Item #2 · Five Wishes',
        type: 'action',
        duration: '12 min',
        driveId: '1S1z3navV1I5A17WPiCOnkdNWHM-2HElf',
        resources: [
          {
            kind: 'tool',
            label: 'Five Wishes',
            url: 'https://www.fivewishes.org/',
            hint: 'Legally valid in 46 states · ~$5',
          },
        ],
        takeaways: [
          'The one document that covers medical, personal, and spiritual',
          'Why "Five Wishes" reads like a letter — not a contract',
          'How to keep it current and accessible to your proxy',
        ],
      },
      {
        id: 'physical-action-3',
        number: '04.04',
        title: 'Action Item #3 · Ceremony & Disposition',
        type: 'action',
        duration: '10 min',
        driveId: '1pjE-AWDNemWfwUmphK6prTytZItjAhMv',
        takeaways: [
          'Articulate ceremony preferences without prescribing every detail',
          'Disposition options: traditional, cremation, terramation, donation',
          'How to leave room for the living to grieve their way',
        ],
      },
      {
        id: 'physical-explore',
        number: '04.05',
        title: 'Explore · Stories & Resources',
        type: 'explore',
        duration: '40 min',
        driveId: '1cd2AlwA_XvtiiZ3hDDS5NPaZ8d_v3BBs',
        resources: [
          {
            kind: 'video',
            label: 'Dying to Meet Marianne Matzo, PhD',
            url: 'https://drive.google.com/file/d/1cd2AlwA_XvtiiZ3hDDS5NPaZ8d_v3BBs/view',
            hint: 'Conversation · 22 min',
          },
          {
            kind: 'podcast',
            label: 'Stoke Doctor\'s Urgent Plea · Michael Madison, MD',
            url: 'https://www.youtube.com/watch?v=4fG5Tk5bZQg',
            hint: 'Why advance care plans matter',
          },
          {
            kind: 'podcast',
            label: 'Terramation: Human Composting · Brienna Smith',
            url: 'https://www.youtube.com/watch?v=R23N3_n-erU',
            hint: 'Transforming death into life',
          },
          {
            kind: 'podcast',
            label: 'The Shocking Future of Funerals · Joél Simone Maldonado',
            url: 'https://www.youtube.com/watch?v=0_06KPrVnlg',
            hint: 'Embalming expert · industry shift',
          },
        ],
        takeaways: [
          'Hear from a palliative-care educator about what most people miss',
          'The case for advance care planning — from a stroke physician',
          'How disposition options are evolving beyond what most know',
        ],
      },
    ],
  },
  build: {
    number: '01',
    label: 'BUILD MY PROJECT',
    description: 'Set the foundation. One video, one form. Pre-fills the six domains ahead.',
    totalLessons: 1,
    startedLessons: 0,
    xpPerLesson: 100,
    lessons: [
      {
        id: 'build-foundation',
        number: '01.01',
        title: 'Build My Project — Foundation Setup',
        type: 'action',
        duration: '10 min',
        driveId: '14Ap77YmhXueUokk3m0O7iXQ_svvAQzRz',
        resources: [
          {
            kind: 'typeform',
            label: 'Project Builder form',
            url: 'https://jbigogmrgex.typeform.com/to/WTCq3oCB',
            hint: 'Private to you · ~5 minutes',
          },
        ],
        takeaways: [
          'Define your scenario focus: die tomorrow, terminal diagnosis, long-term care',
          'Identify the one or two people who must be told first',
          'Set the cadence — how often you\'ll return to the path',
        ],
      },
    ],
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ModuleDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [reflection, setReflection] = useState('');

  const domain = DOMAINS[id];

  if (!domain) {
    return (
      <DashboardLayout title="Path not found" role="org_member">
        <div className="text-center py-16">
          <p className="text-(--lr-pearl) mb-6">That domain isn't available in this demo build.</p>
          <button onClick={() => router.push('/org/member/dashboard')} className="lr-btn-primary">
            Return to Legacy Path
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const lesson = domain.lessons[activeLessonIdx];
  const completedCount = Object.values(completed).filter(Boolean).length;
  const xpEarned = completedCount * domain.xpPerLesson;
  const progressPct = Math.round((completedCount / domain.totalLessons) * 100);

  const handleComplete = () => {
    setCompleted({ ...completed, [lesson.id]: true });
    if (activeLessonIdx < domain.lessons.length - 1) {
      setTimeout(() => {
        setActiveLessonIdx(activeLessonIdx + 1);
        setReflection('');
      }, 600);
    }
  };

  return (
    <DashboardLayout title={`${domain.number} ${domain.label}`} role="org_member">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-(family-name:--font-jura) tracking-[0.18em] uppercase">
        <button onClick={() => router.push('/org/member/dashboard')} className="text-(--lr-gold-soft) hover:text-(--lr-gold) transition-colors">
          Legacy Path
        </button>
        <span className="text-(--lr-lavender-dust)">/</span>
        <span className="text-(--lr-pearl)">
          {domain.number} {domain.label}
        </span>
      </nav>

      {/* Domain hero */}
      <section
        className="rounded-[14px] mb-6 px-7 py-6 grid md:grid-cols-[1fr_auto] gap-6 items-center"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            {domain.number} · Domain
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-3xl tracking-[0.06em] mt-1">
            {domain.label}
          </h2>
          <p className="text-sm text-(--lr-pearl) leading-relaxed mt-3 max-w-xl opacity-90">
            {domain.description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Mini label="Progress" value={`${progressPct}%`} />
          <Mini label="XP earned" value={`+${xpEarned}`} />
          <Mini label="Lessons" value={`${completedCount}/${domain.totalLessons}`} />
        </div>
      </section>

      {/* Lesson list (collapsible / clickable) */}
      <section
        className="rounded-[14px] mb-6 p-4"
        style={{
          background: 'rgba(28,38,68,0.6)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="lr-eyebrow mb-3 px-2" style={{ color: 'var(--lr-gold-soft)' }}>
          Lessons in this domain
        </p>
        <div className="space-y-1">
          {domain.lessons.map((l, idx) => {
            const isActive = idx === activeLessonIdx;
            const isDone = !!completed[l.id];
            return (
              <button
                key={l.id}
                onClick={() => setActiveLessonIdx(idx)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-[10px] text-left transition-all"
                style={{
                  background: isActive ? 'rgba(212,190,148,0.12)' : 'transparent',
                  border: isActive ? '1px solid var(--lr-gold)' : '1px solid transparent',
                }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[0.7rem] font-(family-name:--font-jetbrains) flex-shrink-0"
                  style={{
                    background: isDone ? 'var(--lr-gold)' : 'rgba(212,190,148,0.1)',
                    color: isDone ? 'var(--lr-navy-deep)' : 'var(--lr-gold)',
                    border: '1px solid var(--lr-gold)',
                  }}
                >
                  {isDone ? '✓' : l.number.split('.')[1]}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-(family-name:--font-instrument) text-(--lr-pearl)">{l.title}</p>
                  <p className="text-[0.65rem] tracking-[0.18em] uppercase font-(family-name:--font-jura) mt-0.5" style={{ color: 'var(--lr-gold-soft)' }}>
                    {l.type} · {l.duration} · +{domain.xpPerLesson} XP
                  </p>
                </div>
              </button>
            );
          })}
          {domain.lessons.length < domain.totalLessons && (
            <div
              className="px-4 py-3 rounded-[10px] text-xs text-(--lr-lavender-dust)"
              style={{ background: 'rgba(212,190,148,0.04)' }}
            >
              + {domain.totalLessons - domain.lessons.length} more lessons available in your full path
            </div>
          )}
        </div>
      </section>

      {/* Active lesson player */}
      <section
        className="rounded-[14px] p-7"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
              Lesson {lesson.number}
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mt-1">
              {lesson.title}
            </h3>
          </div>
          <span
            className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase px-3 py-1 rounded-full"
            style={{
              color: 'var(--lr-gold)',
              border: '1px solid var(--lr-gold)',
            }}
          >
            +{domain.xpPerLesson} XP
          </span>
        </div>

        {/* Embedded Drive video */}
        {lesson.driveId && (
          <div
            className="relative w-full mb-5 overflow-hidden rounded-[10px]"
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
        )}

        {/* Resources — multi-link block (typeforms, tools, podcasts, films) */}
        {(() => {
          const resources: Resource[] = lesson.resources
            ? lesson.resources
            : lesson.externalUrl
            ? [{ kind: 'tool', label: 'Open activity', url: lesson.externalUrl }]
            : [];
          if (resources.length === 0) return null;

          const sectionLabel =
            lesson.type === 'explore'
              ? 'Stories & resources'
              : lesson.type === 'action'
              ? 'Action item'
              : 'Resources';

          return (
            <div
              className="rounded-[10px] p-5 mb-5"
              style={{
                background: 'rgba(212,190,148,0.06)',
                border: '1px solid var(--border-gold)',
              }}
            >
              <p className="lr-eyebrow mb-3" style={{ color: 'var(--lr-gold)' }}>
                {sectionLabel}
              </p>
              <div className="space-y-2">
                {resources.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-4 py-3 rounded-[10px] transition-all hover:bg-white/[0.04] group"
                    style={{ background: 'rgba(28,38,68,0.55)', border: '1px solid var(--border-subtle)' }}
                  >
                    <ResourceIcon kind={r.kind} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-(--lr-pearl) truncate group-hover:text-(--lr-gold) transition-colors">
                        {r.label}
                      </p>
                      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
                        {r.kind} · {r.hint ?? 'opens in new tab'}
                      </p>
                    </div>
                    <span className="text-(--lr-gold) flex-shrink-0">↗</span>
                  </a>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Takeaways */}
        <div className="mb-5">
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

        <hr className="lr-separator my-5" />

        {/* Reflection */}
        <div className="mb-6">
          <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
            Reflection (private to you)
          </p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What stood out? What action will you take this week?"
            rows={3}
            className="w-full rounded-[10px] px-4 py-3 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold) transition-colors resize-none"
            style={{
              background: 'rgba(28,38,68,0.7)',
              border: '1px solid var(--border-subtle)',
            }}
          />
          <p className="text-[0.65rem] text-(--lr-lavender-dust) mt-2">
            Org Admin sees only that you completed the lesson. Your reflection stays with you.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => activeLessonIdx > 0 && setActiveLessonIdx(activeLessonIdx - 1)}
            disabled={activeLessonIdx === 0}
            className="lr-btn-outline disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}
          >
            ← Previous
          </button>
          <button
            onClick={handleComplete}
            disabled={!!completed[lesson.id]}
            className="lr-btn-primary disabled:opacity-60"
          >
            {completed[lesson.id]
              ? '✓ Completed · +' + domain.xpPerLesson + ' XP'
              : 'Mark complete · +' + domain.xpPerLesson + ' XP'}
          </button>
        </div>
      </section>
    </DashboardLayout>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[10px] px-3 py-2.5 text-center"
      style={{
        background: 'rgba(212,190,148,0.07)',
        border: '1px solid rgba(212,190,148,0.22)',
      }}
    >
      <p className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </p>
      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-base">{value}</p>
    </div>
  );
}

/** Tiny iconographic glyph per resource kind. SVG, brand-aligned. */
function ResourceIcon({ kind }: { kind: Resource['kind'] }) {
  const stroke = 'var(--lr-gold)';
  return (
    <span
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        background: 'rgba(212,190,148,0.1)',
        border: '1px solid var(--border-gold)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        {kind === 'video' && (
          <>
            <rect x="1" y="3" width="14" height="10" rx="2" stroke={stroke} strokeWidth="1.2" />
            <path d="M7 6L10.5 8L7 10V6Z" fill={stroke} />
          </>
        )}
        {kind === 'podcast' && (
          <>
            <rect x="6" y="1" width="4" height="9" rx="2" stroke={stroke} strokeWidth="1.2" />
            <path d="M3 7V8C3 10.7614 5.23858 13 8 13M13 7V8C13 10.7614 10.7614 13 8 13M8 13V15" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}
        {kind === 'typeform' && (
          <>
            <rect x="2" y="2" width="12" height="12" rx="2" stroke={stroke} strokeWidth="1.2" />
            <path d="M5 6H11M5 9H11M5 12H8" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}
        {kind === 'tool' && (
          <>
            <path d="M11 1L8 4L8 8L4 12L4 13.5L1 13.5M11 1L13.5 1L13.5 3.5L15 5L11 9L8 6L11 1Z" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </span>
  );
}
