'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

interface Lesson {
  id: string;
  number: string;
  title: string;
  type: 'video' | 'reading' | 'action';
  duration: string;
  driveId?: string;
  externalUrl?: string;
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
    totalLessons: 6,
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
        title: 'Action Item · Project Goal Setting',
        type: 'action',
        duration: '8 min',
        driveId: '1_B3bBOZhEdRtAnLmIjgCNMQcoVyIpDy3',
        externalUrl: 'https://jbigogmrgex.typeform.com/to/WfLmFB8k',
        takeaways: [
          'Define what "ready" looks like for you',
          'Identify the one fear holding you back',
          'Set a 30-day legal milestone',
        ],
      },
      {
        id: 'legal-team',
        number: '01.03',
        title: 'Action Item · Assign Roles for Your Legacy Team',
        type: 'action',
        duration: '10 min',
        driveId: '1ksCg6c0n_idjwtFUZf6w2CgdFZFS1Sj5',
        externalUrl: 'https://jbigogmrgex.typeform.com/to/pIgpXkq6',
        takeaways: [
          'Choose your executor (and a backup)',
          'Identify your healthcare proxy',
          'Document the people who matter — and how they connect',
        ],
      },
      {
        id: 'legal-will',
        number: '01.04',
        title: 'Action Item · Plan Your Will',
        type: 'action',
        duration: '15 min',
        driveId: '1jcKfaFZUgBYH6Akhb3w4cDITO8NtcL9o',
        externalUrl: 'https://trustandwill.com/',
        takeaways: [
          'DIY vs attorney-drafted — when each makes sense',
          'The three things even a simple will must include',
          'How to keep it current after life changes',
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
    totalLessons: 4,
    startedLessons: 0,
    xpPerLesson: 80,
    lessons: [
      {
        id: 'physical-around-world',
        number: '04.01',
        title: 'Death Around the World',
        type: 'video',
        duration: '11 min',
        driveId: '1zqxFiEMaTcbfi-2I4YMO8QSzADi2Kgzl',
        takeaways: [
          'How different cultures honour the same threshold',
          'Why "talking about it" doesn\'t shorten life',
          'Choosing what feels right for you',
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
      <DashboardLayout title="Path not found" role="employee">
        <div className="text-center py-16">
          <p className="text-(--lr-pearl) mb-6">That domain isn't available in this demo build.</p>
          <button onClick={() => router.push('/employee/dashboard')} className="lr-btn-primary">
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
    <DashboardLayout title={`${domain.number} ${domain.label}`} role="employee">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-(family-name:--font-jura) tracking-[0.18em] uppercase">
        <button onClick={() => router.push('/employee/dashboard')} className="text-(--lr-gold-soft) hover:text-(--lr-gold) transition-colors">
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

        {/* Action item external link */}
        {lesson.externalUrl && (
          <div
            className="rounded-[10px] p-4 mb-5 flex items-center justify-between gap-4"
            style={{
              background: 'rgba(212,190,148,0.08)',
              border: '1px solid var(--border-gold)',
            }}
          >
            <div>
              <p className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.22em] uppercase text-(--lr-gold-soft)">
                Action Item
              </p>
              <p className="text-sm text-(--lr-pearl) mt-0.5">
                Complete the linked activity to mark this lesson done.
              </p>
            </div>
            <a
              href={lesson.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lr-btn-primary whitespace-nowrap"
            >
              Open ↗
            </a>
          </div>
        )}

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
            HR sees only that you completed the lesson. Your reflection stays with you.
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
