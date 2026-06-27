'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useDemoMode } from '@/lib/demo-mode';
import { useAuth } from '@/contexts/AuthContext';
import { DOMAINS, type Resource } from '@/lib/module-content';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ModuleDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { isDemoFocusMode } = useDemoMode();
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completed, setCompleted] = useState<Record<string, string>>({});
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

  const moduleProgressKey = user ? `lr_module_progress_${user.id}_${id}` : null;

  useEffect(() => {
    if (!moduleProgressKey) return;
    const raw = localStorage.getItem(moduleProgressKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { completed?: Record<string, string | boolean> };
      const normalized = Object.entries(parsed.completed ?? {}).reduce<Record<string, string>>((acc, [lessonId, value]) => {
        if (typeof value === 'string') {
          acc[lessonId] = value;
        } else if (value === true) {
          acc[lessonId] = new Date().toISOString();
        }
        return acc;
      }, {});
      setCompleted(normalized);
    } catch {
      // Ignore malformed local draft in demo mode.
    }
  }, [moduleProgressKey]);

  useEffect(() => {
    if (!moduleProgressKey) return;
    localStorage.setItem(
      moduleProgressKey,
      JSON.stringify({
        domainId: id,
        domainLabel: domain.label,
        updatedAt: new Date().toISOString(),
        completed,
        lessonMeta: domain.lessons.reduce<Record<string, { title: string; number: string }>>((acc, item) => {
          acc[item.id] = { title: item.title, number: item.number };
          return acc;
        }, {}),
      })
    );
  }, [moduleProgressKey, completed, id, domain.label, domain.lessons]);

  const handleComplete = () => {
    setCompleted({ ...completed, [lesson.id]: new Date().toISOString() });
    if (activeLessonIdx < domain.lessons.length - 1) {
      setTimeout(() => {
        setActiveLessonIdx(activeLessonIdx + 1);
        setReflection('');
      }, 600);
    }
  };

  const handleDownloadLegalPlaybookMock = () => {
    if (!user || id !== 'legal' || progressPct < 100) return;

    const legacyRaw = localStorage.getItem(LEGACY_TEAM_FORM_KEY);
    let legacyTeam: LegacyTeamFormState | null = null;
    if (legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw) as { form?: LegacyTeamFormState };
        legacyTeam = parsed.form ?? null;
      } catch {
        legacyTeam = null;
      }
    }

    const completedLessons = domain.lessons
      .filter((item) => !!completed[item.id])
      .map((item) => {
        const completedAt = completed[item.id];
        const dateText = completedAt ? new Date(completedAt).toLocaleDateString() : 'Completed';
        return `<li><strong>${item.number} ${escapeHtml(item.title)}</strong> <span style="color:#a4acc8;">(${dateText})</span></li>`;
      })
      .join('');

    const roleRows = [
      ['Executor', legacyTeam?.executorPrimary ?? ''],
      ['Secondary Executor', legacyTeam?.executorSecondary ?? ''],
      ['Power of Attorney', legacyTeam?.powerOfAttorney ?? ''],
      ['POA Successor', legacyTeam?.powerOfAttorneySuccessor ?? ''],
      ['Medical Proxy', legacyTeam?.medicalProxy ?? ''],
      ['Secondary Medical Proxy', legacyTeam?.medicalProxySecondary ?? ''],
    ]
      .map(([label, value]) => `<tr><td style="padding:8px 10px;border:1px solid #c9b17f;">${escapeHtml(label)}</td><td style="padding:8px 10px;border:1px solid #c9b17f;">${escapeHtml(value || 'Not provided')}</td></tr>`)
      .join('');

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>FinalPlaybook - ${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</title>
</head>
<body style="font-family: Georgia, 'Times New Roman', serif; margin:0; background:#0e1226; color:#f7f3ea;">
  <div style="max-width:900px; margin:0 auto; padding:32px;">
    <div style="border:1px solid #c9b17f; padding:22px; background:linear-gradient(180deg,#1a2348 0%,#0e1226 100%);">
      <p style="letter-spacing:0.18em; text-transform:uppercase; font-size:11px; color:#d4be94; margin:0 0 6px 0;">Legacy Readiness OS</p>
      <h1 style="margin:0; color:#d4be94; font-size:34px; letter-spacing:0.06em;">FINALPLAYBOOK</h1>
      <p style="margin:8px 0 0 0; color:#e8e0cf;">Legal section mock export for demo</p>
      <p style="margin:10px 0 0 0; font-size:13px; color:#a4acc8;">Prepared for ${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)} · ${new Date().toLocaleDateString()}</p>
    </div>

    <div style="margin-top:22px; border:1px solid #263157; background:#141c3c; padding:20px;">
      <h2 style="margin:0 0 10px 0; color:#d4be94; font-size:22px;">Legal Completion Summary</h2>
      <p style="margin:0 0 8px 0; color:#e8e0cf;">Progress: 100% complete (${completedCount}/${domain.totalLessons} lessons)</p>
      <ul style="margin:8px 0 0 18px; padding:0; line-height:1.65; color:#f7f3ea;">${completedLessons || '<li>No completed lessons recorded.</li>'}</ul>
    </div>

    <div style="margin-top:22px; border:1px solid #263157; background:#141c3c; padding:20px;">
      <h2 style="margin:0 0 10px 0; color:#d4be94; font-size:22px;">Legacy Team Fillable Data</h2>
      <p style="margin:0 0 12px 0; color:#a4acc8;">Pulled from Action Item #2 form for demo preview.</p>
      <table style="width:100%; border-collapse:collapse; background:#0f1633; color:#f7f3ea;">${roleRows}</table>
      <p style="margin:12px 0 0 0; color:#e8e0cf;">
        One-on-One with Niki: ${escapeHtml(formatStatusWithDateForExport(legacyTeam?.bookedCallStatus ?? '', legacyTeam?.bookedCallDueMonth ?? '', legacyTeam?.bookedCallDueDay ?? '', legacyTeam?.bookedCallDueYear ?? ''))}
      </p>
      <p style="margin:6px 0 0 0; color:#e8e0cf;">
        Topic list prepared: ${escapeHtml(formatStatusWithDateForExport(legacyTeam?.listedTopicsStatus ?? '', legacyTeam?.listedTopicsDueMonth ?? '', legacyTeam?.listedTopicsDueDay ?? '', legacyTeam?.listedTopicsDueYear ?? ''))}
      </p>
    </div>

    <p style="margin-top:20px; font-size:12px; color:#a4acc8;">Demo note: in production this would be generated server-side as PDF and stored in DB.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const popup = window.open(url, '_blank', 'noopener,noreferrer');

    if (!popup) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `FinalPlaybook_LegalMock_${user.firstName}_${user.lastName}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
      {!isDemoFocusMode && <section
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
      </section>}

      {/* Active lesson player */}
      <section
        className="rounded-[14px] p-7"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div
          className="rounded-[10px] px-4 py-3 mb-5"
          style={{ background: 'rgba(212,190,148,0.07)', border: '1px solid var(--border-gold)' }}
        >
          <p className="font-(family-name:--font-jura) text-[0.62rem] tracking-[0.2em] uppercase text-(--lr-gold-soft) mb-1">
            What to do now
          </p>
          <p className="text-sm text-(--lr-pearl) leading-relaxed">
            1) Watch the lesson. 2) Open at least one resource. 3) Mark complete to unlock the next step.
          </p>
        </div>

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

        {lesson.id === 'legal-team' && <LegacyTeamActionForm />}

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
        {!isDemoFocusMode && <div className="mb-6">
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
        </div>}

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

        {id === 'legal' && progressPct === 100 && (
          <div
            className="mt-6 rounded-[10px] p-5"
            style={{ background: 'rgba(212,190,148,0.07)', border: '1px solid var(--border-gold)' }}
          >
            <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold)' }}>
              Demo deliverable unlocked
            </p>
            <h4 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-2">
              Download branded FinalPlaybook (mock)
            </h4>
            <p className="text-sm text-(--lr-pearl) opacity-90 mb-4">
              Legal is now 100% complete. Export a branded mock file containing completed legal lessons and your fillable Legacy Team action item data.
            </p>
            <button onClick={handleDownloadLegalPlaybookMock} className="lr-btn-primary">
              Open legal playbook PDF preview
            </button>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
        {kind === 'pdf' && (
          <>
            <path d="M4 1.5H9.5L13 5V14.5H4V1.5Z" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M9.5 1.5V5H13" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M5.5 10.5H11.5" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}
        {kind === 'quiz' && (
          <>
            <circle cx="8" cy="8" r="6.5" stroke={stroke} strokeWidth="1.2" />
            <path d="M6.4 6.6C6.4 5.7 7.1 5 8 5C8.9 5 9.6 5.6 9.6 6.5C9.6 7.7 8 7.8 8 9" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="8" cy="11.4" r="0.8" fill={stroke} />
          </>
        )}
      </svg>
    </span>
  );
}

type StatusChoice = 'check' | 'not_yet' | '';

interface LegacyTeamFormState {
  bookedCallStatus: StatusChoice;
  bookedCallDueMonth: string;
  bookedCallDueDay: string;
  bookedCallDueYear: string;
  listedTopicsStatus: StatusChoice;
  listedTopicsDueMonth: string;
  listedTopicsDueDay: string;
  listedTopicsDueYear: string;
  executorPrimary: string;
  executorSecondary: string;
  powerOfAttorney: string;
  powerOfAttorneySuccessor: string;
  medicalProxy: string;
  medicalProxySecondary: string;
}

const LEGACY_TEAM_FORM_KEY = 'lr_legal_team_action_item_v1';

const LEGACY_TEAM_INITIAL: LegacyTeamFormState = {
  bookedCallStatus: '',
  bookedCallDueMonth: '',
  bookedCallDueDay: '',
  bookedCallDueYear: '',
  listedTopicsStatus: '',
  listedTopicsDueMonth: '',
  listedTopicsDueDay: '',
  listedTopicsDueYear: '',
  executorPrimary: '',
  executorSecondary: '',
  powerOfAttorney: '',
  powerOfAttorneySuccessor: '',
  medicalProxy: '',
  medicalProxySecondary: '',
};

function LegacyTeamActionForm() {
  const [form, setForm] = useState<LegacyTeamFormState>(LEGACY_TEAM_INITIAL);
  const [savedAt, setSavedAt] = useState<string>('');

  useEffect(() => {
    const raw = localStorage.getItem(LEGACY_TEAM_FORM_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { form: LegacyTeamFormState; savedAt: string };
      if (parsed.form) setForm(parsed.form);
      if (parsed.savedAt) setSavedAt(parsed.savedAt);
    } catch {
      // Ignore malformed local draft in demo mode.
    }
  }, []);

  const setField = <K extends keyof LegacyTeamFormState>(key: K, value: LegacyTeamFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveForm = () => {
    const saved = new Date().toISOString();
    localStorage.setItem(LEGACY_TEAM_FORM_KEY, JSON.stringify({ form, savedAt: saved }));
    setSavedAt(saved);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveForm();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      saveForm();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="rounded-[10px] p-5 mb-5"
      style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
    >
      <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold)' }}>
        Fillable Action Item
      </p>
      <h4 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-2">
        It is time to assign roles for your Legacy Team
      </h4>
      <p className="text-sm text-(--lr-pearl) opacity-90 leading-relaxed mb-4">
        It may overlap with your Know/Love/Trust list from last week. If unsure, pause and discuss role fit during your one-on-one call with Niki.
      </p>

      <div className="space-y-4">
        <ChecklistWithDate
          title="I booked my One-on-One call with Niki"
          status={form.bookedCallStatus}
          onStatusChange={(value) => setField('bookedCallStatus', value)}
          month={form.bookedCallDueMonth}
          day={form.bookedCallDueDay}
          year={form.bookedCallDueYear}
          onMonth={(value) => setField('bookedCallDueMonth', value)}
          onDay={(value) => setField('bookedCallDueDay', value)}
          onYear={(value) => setField('bookedCallDueYear', value)}
        />

        <ChecklistWithDate
          title="I made a list of topics I want to discuss in my One-on-One call"
          status={form.listedTopicsStatus}
          onStatusChange={(value) => setField('listedTopicsStatus', value)}
          month={form.listedTopicsDueMonth}
          day={form.listedTopicsDueDay}
          year={form.listedTopicsDueYear}
          onMonth={(value) => setField('listedTopicsDueMonth', value)}
          onDay={(value) => setField('listedTopicsDueDay', value)}
          onYear={(value) => setField('listedTopicsDueYear', value)}
        />
      </div>

      <hr className="lr-separator my-5" />

      <div className="grid md:grid-cols-2 gap-3">
        <FillableField
          label="Name your choice for Executor"
          value={form.executorPrimary}
          onChange={(value) => setField('executorPrimary', value)}
        />
        <FillableField
          label="Name your backup / Secondary Executor"
          value={form.executorSecondary}
          onChange={(value) => setField('executorSecondary', value)}
        />
        <FillableField
          label="Name your choice for Power of Attorney"
          value={form.powerOfAttorney}
          onChange={(value) => setField('powerOfAttorney', value)}
        />
        <FillableField
          label="Name your Power of Attorney successor / alternate"
          value={form.powerOfAttorneySuccessor}
          onChange={(value) => setField('powerOfAttorneySuccessor', value)}
        />
        <FillableField
          label="Name your choice for Medical Proxy"
          value={form.medicalProxy}
          onChange={(value) => setField('medicalProxy', value)}
        />
        <FillableField
          label="Name your backup / Secondary Medical Proxy"
          value={form.medicalProxySecondary}
          onChange={(value) => setField('medicalProxySecondary', value)}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[0.65rem] text-(--lr-lavender-dust)">
          Submit with button or press Ctrl + Enter.
        </p>
        <button type="submit" className="lr-btn-primary">
          Submit
        </button>
      </div>

      {savedAt && (
        <p className="text-[0.65rem] text-(--lr-gold-soft) mt-3">
          Saved locally: {new Date(savedAt).toLocaleString()}
        </p>
      )}
    </form>
  );
}

function FillableField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-(--lr-gold-soft) tracking-[0.14em] uppercase font-(family-name:--font-jura)">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type your answer here..."
        className="mt-2 w-full rounded-[10px] px-3 py-2.5 text-sm bg-transparent"
        style={{ border: '1px solid var(--border-subtle)', color: 'var(--lr-pearl)' }}
      />
    </label>
  );
}

function ChecklistWithDate({
  title,
  status,
  onStatusChange,
  month,
  day,
  year,
  onMonth,
  onDay,
  onYear,
}: {
  title: string;
  status: StatusChoice;
  onStatusChange: (value: StatusChoice) => void;
  month: string;
  day: string;
  year: string;
  onMonth: (value: string) => void;
  onDay: (value: string) => void;
  onYear: (value: string) => void;
}) {
  return (
    <div
      className="rounded-[10px] p-4"
      style={{ background: 'rgba(28,38,68,0.55)', border: '1px solid var(--border-subtle)' }}
    >
      <p className="text-sm text-(--lr-pearl) mb-3">{title}</p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          type="button"
          onClick={() => onStatusChange('check')}
          className="px-3 py-1.5 rounded-[8px] text-xs font-(family-name:--font-jura) tracking-[0.14em] uppercase"
          style={{
            border: '1px solid var(--border-gold)',
            color: status === 'check' ? 'var(--lr-navy-deep)' : 'var(--lr-gold)',
            background: status === 'check' ? 'var(--lr-gold)' : 'transparent',
          }}
        >
          A · Check
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('not_yet')}
          className="px-3 py-1.5 rounded-[8px] text-xs font-(family-name:--font-jura) tracking-[0.14em] uppercase"
          style={{
            border: '1px solid var(--border-gold)',
            color: status === 'not_yet' ? 'var(--lr-navy-deep)' : 'var(--lr-gold)',
            background: status === 'not_yet' ? 'var(--lr-gold)' : 'transparent',
          }}
        >
          B · Not Yet
        </button>
      </div>

      <p className="text-[0.7rem] text-(--lr-lavender-dust) mb-2">I would like to have this completed by:</p>
      <div className="grid grid-cols-3 gap-2">
        <input
          value={month}
          onChange={(event) => onMonth(event.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
          placeholder="MM"
          className="rounded-[8px] px-3 py-2 text-sm bg-transparent"
          style={{ border: '1px solid var(--border-subtle)', color: 'var(--lr-pearl)' }}
        />
        <input
          value={day}
          onChange={(event) => onDay(event.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
          placeholder="DD"
          className="rounded-[8px] px-3 py-2 text-sm bg-transparent"
          style={{ border: '1px solid var(--border-subtle)', color: 'var(--lr-pearl)' }}
        />
        <input
          value={year}
          onChange={(event) => onYear(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
          placeholder="YYYY"
          className="rounded-[8px] px-3 py-2 text-sm bg-transparent"
          style={{ border: '1px solid var(--border-subtle)', color: 'var(--lr-pearl)' }}
        />
      </div>
    </div>
  );
}

function formatStatusWithDateForExport(status: StatusChoice, month: string, day: string, year: string): string {
  const statusText = status === 'check' ? 'Check' : status === 'not_yet' ? 'Not yet' : 'Not set';
  const hasDate = month || day || year;
  if (!hasDate) return statusText;
  return `${statusText} - target ${month || 'MM'}/${day || 'DD'}/${year || 'YYYY'}`;
}
