'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees, mockProgress, mockModules } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import LRMonogram from '@/components/common/LRMonogram';

interface PersistedModuleProgress {
  domainId?: string;
  domainLabel?: string;
  completed?: Record<string, string | boolean>;
  lessonMeta?: Record<string, { title: string; number: string }>;
}

interface CompletedLessonSummary {
  storageKey: string;
  domainLabel: string;
  lessonId: string;
  lessonTitle: string;
  lessonNumber: string;
  completedAt: string;
}

interface LegacyTeamFormState {
  bookedCallStatus: 'check' | 'not_yet' | '';
  bookedCallDueMonth: string;
  bookedCallDueDay: string;
  bookedCallDueYear: string;
  listedTopicsStatus: 'check' | 'not_yet' | '';
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

interface PlaybookChecklistState {
  reviewedWithExecutor: boolean;
  sharedDocumentLocation: boolean;
  confirmedPOAContacts: boolean;
  scheduledAnnualReview: boolean;
  notes: string;
}

const PLAYBOOK_CHECKLIST_DEFAULT: PlaybookChecklistState = {
  reviewedWithExecutor: false,
  sharedDocumentLocation: false,
  confirmedPOAContacts: false,
  scheduledAnnualReview: false,
  notes: '',
};

export default function FinalPlaybookPage() {
  const { user } = useAuth();
  if (!user) return null;

  const [completedLessons, setCompletedLessons] = useState<CompletedLessonSummary[]>([]);
  const [legacyTeam, setLegacyTeam] = useState<LegacyTeamFormState | null>(null);
  const [checklist, setChecklist] = useState<PlaybookChecklistState>(PLAYBOOK_CHECKLIST_DEFAULT);
  const [checklistSavedAt, setChecklistSavedAt] = useState<string>('');

  const employee = mockEmployees.find((e) => e.id === user.id);
  const progress = employee?.progressPercentage ?? 0;

  const memberProgress = mockProgress.filter((p) => p.employeeId === user.id);
  const completedModules = memberProgress.filter((p) => p.status === 'completed');
  const inProgressModules = memberProgress.filter((p) => p.status === 'in_progress');
  const hoursInvested = completedModules.reduce((sum, p) => {
    const m = mockModules.find((mod) => mod.id === p.moduleId);
    return sum + (m?.estimatedHours ?? 0);
  }, 0);

  // Three states map to demo personas: AT_RISK, STARTING, PROTECTED.
  const sectionsReady = progress >= 70 ? 4 : progress >= 25 ? 1 : 0;

  const sections = [
    { number: '01', label: 'LEGAL',     ready: progress >= 70 || progress >= 25 ? progress >= 25 : false, summary: 'Will, executor, healthcare proxy, power of attorney' },
    { number: '02', label: 'FINANCIAL', ready: progress >= 70, summary: 'Account index, beneficiaries, monthly obligations' },
    { number: '03', label: 'DIGITAL',   ready: progress >= 70, summary: 'Login vault inheritance, social profiles, devices' },
    { number: '04', label: 'PHYSICAL',  ready: progress >= 70, summary: 'Belongings of meaning, ceremony preferences, location of papers' },
  ];

  const checklistStorageKey = `lr_final_playbook_checklist_${user.id}`;

  useEffect(() => {
    const prefix = `lr_module_progress_${user.id}_`;
    const found: CompletedLessonSummary[] = [];

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw) as PersistedModuleProgress;
        const completed = parsed.completed ?? {};
        const lessonMeta = parsed.lessonMeta ?? {};
        const domainLabel = parsed.domainLabel ?? parsed.domainId ?? 'Domain';

        Object.entries(completed).forEach(([lessonId, value]) => {
          if (!value) return;
          const completedAt = typeof value === 'string' ? value : new Date().toISOString();
          const meta = lessonMeta[lessonId];
          found.push({
            storageKey: key,
            domainLabel,
            lessonId,
            lessonTitle: meta?.title ?? lessonId,
            lessonNumber: meta?.number ?? '--',
            completedAt,
          });
        });
      } catch {
        // Ignore malformed local records.
      }
    }

    found.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    setCompletedLessons(found);

    const legacyRaw = localStorage.getItem(LEGACY_TEAM_FORM_KEY);
    if (legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw) as { form?: LegacyTeamFormState };
        if (parsed.form) setLegacyTeam(parsed.form);
      } catch {
        // Ignore malformed local records.
      }
    }

    const checklistRaw = localStorage.getItem(checklistStorageKey);
    if (checklistRaw) {
      try {
        const parsed = JSON.parse(checklistRaw) as { checklist?: PlaybookChecklistState; savedAt?: string };
        if (parsed.checklist) setChecklist(parsed.checklist);
        if (parsed.savedAt) setChecklistSavedAt(parsed.savedAt);
      } catch {
        // Ignore malformed local records.
      }
    }
  }, [user.id, checklistStorageKey]);

  const completedLessonCount = completedLessons.length;

  const timelineSummary = useMemo(() => {
    const count = [
      checklist.reviewedWithExecutor,
      checklist.sharedDocumentLocation,
      checklist.confirmedPOAContacts,
      checklist.scheduledAnnualReview,
    ].filter(Boolean).length;
    return `${count}/4 checklist items confirmed`;
  }, [checklist]);

  const saveChecklist = () => {
    const savedAt = new Date().toISOString();
    localStorage.setItem(checklistStorageKey, JSON.stringify({ checklist, savedAt }));
    setChecklistSavedAt(savedAt);
  };

  const openPrintablePreview = (html: string, fallbackFileName: string) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const popup = window.open(url, '_blank', 'noopener,noreferrer');

    if (!popup) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fallbackFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const handleDownload = () => {
    if (sectionsReady === 0) return;
    const generated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>FinalPlaybook Preview</title>
</head>
<body style="font-family: Georgia, 'Times New Roman', serif; margin:0; background:#0e1226; color:#f7f3ea;">
  <div style="max-width:900px; margin:0 auto; padding:32px;">
    <div style="border:1px solid #c9b17f; padding:22px; background:linear-gradient(180deg,#1a2348 0%,#0e1226 100%);">
      <p style="letter-spacing:0.18em; text-transform:uppercase; font-size:11px; color:#d4be94; margin:0 0 6px 0;">Legacy Readiness OS</p>
      <h1 style="margin:0; color:#d4be94; font-size:34px; letter-spacing:0.06em;">FINALPLAYBOOK</h1>
      <p style="margin:8px 0 0 0; color:#e8e0cf;">Demo preview for Save as PDF</p>
      <p style="margin:10px 0 0 0; font-size:13px; color:#a4acc8;">Prepared for ${user.firstName} ${user.lastName} · ${generated}</p>
    </div>

    <div style="margin-top:22px; border:1px solid #263157; background:#141c3c; padding:20px;">
      <h2 style="margin:0 0 10px 0; color:#d4be94; font-size:22px;">Section Readiness</h2>
      <p style="margin:0 0 10px 0; color:#e8e0cf;">Sections ready: ${sectionsReady} of 4</p>
      <ul style="margin:8px 0 0 18px; padding:0; line-height:1.8; color:#f7f3ea;">
        <li>01 Legal: ${sections[0].ready ? 'Compiled' : 'Pending'}</li>
        <li>02 Financial: ${sections[1].ready ? 'Compiled' : 'Pending'}</li>
        <li>03 Digital: ${sections[2].ready ? 'Compiled' : 'Pending'}</li>
        <li>04 Physical: ${sections[3].ready ? 'Compiled' : 'Pending'}</li>
      </ul>
    </div>

    <p style="margin-top:20px; font-size:12px; color:#a4acc8;">Use browser Print and choose Save as PDF.</p>
  </div>
</body>
</html>`;
    openPrintablePreview(html, `FinalPlaybook_${user.firstName}_${user.lastName}.html`);
  };

  const handleInterimSummary = () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const completedList =
      completedModules.length === 0
        ? '<li>(none yet — your journey is just beginning)</li>'
        : completedModules
            .map((p) => {
              const m = mockModules.find((mod) => mod.id === p.moduleId);
              const date = p.completedAt ? new Date(p.completedAt).toLocaleDateString() : '';
              return `<li>${m?.title ?? p.moduleId} · ${date}</li>`;
            })
            .join('');

    const inProgressList =
      inProgressModules.length === 0
        ? '<li>(nothing currently open)</li>'
        : inProgressModules
            .map((p) => {
              const m = mockModules.find((mod) => mod.id === p.moduleId);
              return `<li>${m?.title ?? p.moduleId} · ${p.progressPercentage}%</li>`;
            })
            .join('');

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Legacy Path Interim Summary</title>
</head>
<body style="font-family: Georgia, 'Times New Roman', serif; margin:0; background:#0e1226; color:#f7f3ea;">
  <div style="max-width:900px; margin:0 auto; padding:32px;">
    <div style="border:1px solid #c9b17f; padding:22px; background:linear-gradient(180deg,#1a2348 0%,#0e1226 100%);">
      <p style="letter-spacing:0.18em; text-transform:uppercase; font-size:11px; color:#d4be94; margin:0 0 6px 0;">Legacy Readiness OS</p>
      <h1 style="margin:0; color:#d4be94; font-size:34px; letter-spacing:0.06em;">INTERIM SUMMARY</h1>
      <p style="margin:10px 0 0 0; font-size:13px; color:#a4acc8;">Member ${user.firstName} ${user.lastName} · ${today}</p>
    </div>

    <div style="margin-top:22px; border:1px solid #263157; background:#141c3c; padding:20px; line-height:1.7;">
      <p style="margin:0;">Overall readiness: ${progress}%</p>
      <p style="margin:0;">Modules completed: ${completedModules.length}</p>
      <p style="margin:0;">Modules in progress: ${inProgressModules.length}</p>
      <p style="margin:0;">Time invested: ${hoursInvested.toFixed(1)} hours</p>
      <p style="margin:0 0 12px 0;">Assessment score: ${employee?.assessmentScore ? `${employee.assessmentScore}/10` : 'Not yet taken'}</p>

      <h3 style="margin:12px 0 6px 0; color:#d4be94;">Completed modules</h3>
      <ul style="margin:0 0 10px 18px; padding:0;">${completedList}</ul>

      <h3 style="margin:12px 0 6px 0; color:#d4be94;">In progress</h3>
      <ul style="margin:0 0 0 18px; padding:0;">${inProgressList}</ul>
    </div>

    <p style="margin-top:20px; font-size:12px; color:#a4acc8;">Use browser Print and choose Save as PDF.</p>
  </div>
</body>
</html>`;
    openPrintablePreview(html, `LegacyPath_InterimSummary_${user.firstName}_${user.lastName}.html`);
  };

  const isComplete = sectionsReady === 4;
  const isLocked = sectionsReady === 0;

  return (
    <DashboardLayout title="FinalPlaybook" role="org_member">
      {/* Hero */}
      <section
        className="rounded-[18px] mb-7 px-8 py-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 opacity-15">
          <LRMonogram size={260} />
        </div>

        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
              Your compiled legacy
            </p>
            <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-4xl tracking-[0.06em] leading-tight">
              My FinalPlaybook
            </h2>
            <p className="text-(--lr-pearl) mt-3 max-w-md leading-relaxed opacity-90">
              {isComplete
                ? 'Every domain is compiled. This document is what your loved ones will reach for.'
                : isLocked
                ? 'Your Playbook compiles itself as you complete domains. You haven\'t started yet.'
                : `${sectionsReady} of 4 sections ready. Each domain you complete adds a chapter.`}
            </p>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <button onClick={handleDownload} disabled={isLocked} className="lr-btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                {isLocked ? 'Locked — begin the path' : isComplete ? 'Open FinalPlaybook PDF preview' : 'Open partial PDF preview'}
              </button>
              <button
                onClick={handleInterimSummary}
                className="lr-btn-outline"
                style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}
              >
                Open interim PDF preview
              </button>
              {!isLocked && (
                <span className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase text-(--lr-lavender-dust)">
                  PDF · {sectionsReady} {sectionsReady === 1 ? 'chapter' : 'chapters'}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PlaybookCover sectionsReady={sectionsReady} userName={`${user.firstName} ${user.lastName}`} />
          </div>
        </div>
      </section>

      {/* Section list */}
      <section className="mb-7">
        <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
          Sections
        </p>
        <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mb-5">
          What's inside
        </h3>

        <div className="grid gap-3">
          {sections.map((s) => (
            <div
              key={s.number}
              className="rounded-[12px] px-6 py-5 flex items-center gap-5"
              style={{
                background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                border: s.ready ? '1px solid var(--border-gold)' : '1px solid rgba(212,190,148,0.1)',
                opacity: s.ready ? 1 : 0.6,
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-(family-name:--font-jura) text-sm tracking-wider"
                style={{
                  background: s.ready ? 'var(--lr-gold)' : 'rgba(212,190,148,0.1)',
                  color: s.ready ? 'var(--lr-navy-deep)' : 'var(--lr-lavender-dust)',
                  border: '1px solid var(--lr-gold)',
                }}
              >
                {s.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em]">
                  {s.label}
                </p>
                <p className="text-sm text-(--lr-pearl) opacity-85 mt-0.5">{s.summary}</p>
              </div>
              <span
                className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase px-3 py-1.5 rounded-full whitespace-nowrap"
                style={{
                  color: s.ready ? 'var(--lr-navy-deep)' : 'var(--lr-lavender-dust)',
                  background: s.ready ? 'var(--lr-gold)' : 'rgba(212,190,148,0.06)',
                  border: s.ready ? '1px solid var(--lr-gold)' : '1px solid rgba(212,190,148,0.18)',
                }}
              >
                {s.ready ? '✓ Compiled' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="rounded-[14px] p-6 mb-7"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
          Built from what you completed
        </p>
        <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mb-3">
          Action items already captured
        </h3>
        <p className="text-sm text-(--lr-pearl) opacity-85 mb-4">
          {completedLessonCount} lesson action item{completedLessonCount === 1 ? '' : 's'} completed in your current draft.
        </p>

        {completedLessons.length === 0 ? (
          <p className="text-sm text-(--lr-lavender-dust)">
            No completed lesson actions found yet. As you mark lessons complete, they will be listed here.
          </p>
        ) : (
          <div className="space-y-2">
            {completedLessons.slice(0, 10).map((item) => (
              <div
                key={`${item.storageKey}:${item.lessonId}`}
                className="rounded-[10px] px-4 py-3 flex items-center justify-between gap-4"
                style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm text-(--lr-pearl)">{item.lessonNumber} · {item.lessonTitle}</p>
                  <p className="text-[0.65rem] text-(--lr-gold-soft) mt-0.5">{item.domainLabel}</p>
                </div>
                <span className="text-[0.65rem] text-(--lr-lavender-dust) whitespace-nowrap">
                  {new Date(item.completedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section
        className="rounded-[14px] p-6 mb-7"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
          Fillable checklist
        </p>
        <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mb-3">
          FinalPlaybook readiness checklist
        </h3>
        <p className="text-sm text-(--lr-pearl) opacity-85 mb-4">{timelineSummary}</p>

        <div className="space-y-2 mb-4">
          <ChecklistToggle
            label="Reviewed FinalPlaybook summary with my Executor"
            checked={checklist.reviewedWithExecutor}
            onChange={(checked) => setChecklist((prev) => ({ ...prev, reviewedWithExecutor: checked }))}
          />
          <ChecklistToggle
            label="Shared document storage location and access method"
            checked={checklist.sharedDocumentLocation}
            onChange={(checked) => setChecklist((prev) => ({ ...prev, sharedDocumentLocation: checked }))}
          />
          <ChecklistToggle
            label="Confirmed POA and Medical Proxy contacts are current"
            checked={checklist.confirmedPOAContacts}
            onChange={(checked) => setChecklist((prev) => ({ ...prev, confirmedPOAContacts: checked }))}
          />
          <ChecklistToggle
            label="Scheduled annual legal review date"
            checked={checklist.scheduledAnnualReview}
            onChange={(checked) => setChecklist((prev) => ({ ...prev, scheduledAnnualReview: checked }))}
          />
        </div>

        <label className="block text-xs text-(--lr-gold-soft) tracking-[0.14em] uppercase font-(family-name:--font-jura) mb-2">
          Notes for FinalPlaybook
        </label>
        <textarea
          value={checklist.notes}
          onChange={(event) => setChecklist((prev) => ({ ...prev, notes: event.target.value }))}
          rows={3}
          placeholder="Add your final reminders, timelines, and follow-ups..."
          className="w-full rounded-[10px] px-3 py-2.5 text-sm bg-transparent"
          style={{ border: '1px solid var(--border-subtle)', color: 'var(--lr-pearl)' }}
        />

        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <button onClick={saveChecklist} className="lr-btn-primary">Save checklist</button>
          {checklistSavedAt && (
            <span className="text-[0.65rem] text-(--lr-lavender-dust)">
              Saved: {new Date(checklistSavedAt).toLocaleString()}
            </span>
          )}
        </div>
      </section>

      {legacyTeam && (
        <section
          className="rounded-[14px] p-6 mb-7"
          style={{
            background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
            Imported from action item
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mb-3">
            Legacy Team assignment snapshot
          </h3>

          <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
            <SummaryRow label="Executor" value={legacyTeam.executorPrimary} />
            <SummaryRow label="Secondary Executor" value={legacyTeam.executorSecondary} />
            <SummaryRow label="Power of Attorney" value={legacyTeam.powerOfAttorney} />
            <SummaryRow label="POA Successor" value={legacyTeam.powerOfAttorneySuccessor} />
            <SummaryRow label="Medical Proxy" value={legacyTeam.medicalProxy} />
            <SummaryRow label="Secondary Medical Proxy" value={legacyTeam.medicalProxySecondary} />
          </div>

          <div className="text-xs text-(--lr-lavender-dust) leading-relaxed">
            One-on-One with Niki: {formatStatusWithDate(
              legacyTeam.bookedCallStatus,
              legacyTeam.bookedCallDueMonth,
              legacyTeam.bookedCallDueDay,
              legacyTeam.bookedCallDueYear
            )}
            <br />
            Topic list prepared: {formatStatusWithDate(
              legacyTeam.listedTopicsStatus,
              legacyTeam.listedTopicsDueMonth,
              legacyTeam.listedTopicsDueDay,
              legacyTeam.listedTopicsDueYear
            )}
          </div>
        </section>
      )}

      {/* Privacy note */}
      <div
        className="rounded-[14px] px-6 py-5 flex items-start gap-4"
        style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
      >
        <span className="text-(--lr-gold) leading-none mt-0.5 text-lg">◆</span>
        <p className="text-sm text-(--lr-pearl) leading-relaxed opacity-90">
          <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-[0.7rem] text-(--lr-gold) block mb-1">
            Yours alone
          </span>
          The FinalPlaybook is generated entirely from the lessons you complete. It contains no PHI or PII you
          haven't entered yourself, and it is never visible to your employer, to XYZ Company, or to Endevo.
        </p>
      </div>
    </DashboardLayout>
  );
}

function ChecklistToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className="flex items-center gap-3 rounded-[10px] px-3 py-2"
      style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-sm text-(--lr-pearl)">{label}</span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] px-3 py-2" style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}>
      <p className="text-[0.6rem] text-(--lr-gold-soft) tracking-[0.16em] uppercase font-(family-name:--font-jura)">{label}</p>
      <p className="text-sm text-(--lr-pearl) mt-1">{value || 'Not set yet'}</p>
    </div>
  );
}

function formatStatusWithDate(status: 'check' | 'not_yet' | '', month: string, day: string, year: string): string {
  const statusText = status === 'check' ? 'Check' : status === 'not_yet' ? 'Not yet' : 'Not set';
  const hasDate = month || day || year;
  if (!hasDate) return statusText;
  return `${statusText} · target ${month || 'MM'}/${day || 'DD'}/${year || 'YYYY'}`;
}

/** Stylized "book cover" preview using SVG. */
function PlaybookCover({ sectionsReady, userName }: { sectionsReady: number; userName: string }) {
  return (
    <div
      className="rounded-[10px] w-[220px] h-[300px] relative overflow-hidden flex flex-col items-center justify-center text-center px-6"
      style={{
        background: 'linear-gradient(160deg, #1A2348 0%, #0E1226 100%)',
        border: '1px solid var(--lr-gold)',
        boxShadow: '0 30px 60px -30px rgba(212,190,148,0.4), inset 0 0 0 4px rgba(212,190,148,0.15)',
      }}
    >
      <LRMonogram size={64} />
      <p className="mt-4 font-(family-name:--font-italiana) text-(--lr-gold) text-base tracking-[0.18em] leading-tight">
        FINAL<br />PLAYBOOK
      </p>
      <hr className="lr-separator my-3 w-full" />
      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase text-(--lr-pearl)">
        Prepared for
      </p>
      <p className="text-(--lr-pearl) text-sm mt-1 truncate w-full">
        {userName}
      </p>
      <p className="font-(family-name:--font-jetbrains) text-[0.6rem] text-(--lr-gold-soft) mt-3">
        {sectionsReady}/4 chapters
      </p>
    </div>
  );
}
