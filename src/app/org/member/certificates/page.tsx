'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockEmployees, mockProgress, mockModules } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import LRMonogram from '@/components/common/LRMonogram';

export default function FinalPlaybookPage() {
  const { user } = useAuth();
  if (!user) return null;

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

  const handleDownload = () => {
    if (sectionsReady === 0) return;
    const content = `
═══════════════════════════════════════════════════
            FINAL PLAYBOOK · DEMO PREVIEW
        Legacy Readiness OS · Powered by Endevo
═══════════════════════════════════════════════════

Prepared for:  ${user.firstName} ${user.lastName}
Generated:     ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

This document is generated only when you have completed
the corresponding domains of your Legacy Path.

Sections ready:  ${sectionsReady} of 4

— 01 LEGAL —
${sections[0].ready ? '✓ Compiled' : '· Pending'}

— 02 FINANCIAL —
${sections[1].ready ? '✓ Compiled' : '· Pending'}

— 03 DIGITAL —
${sections[2].ready ? '✓ Compiled' : '· Pending'}

— 04 PHYSICAL —
${sections[3].ready ? '✓ Compiled' : '· Pending'}

═══════════════════════════════════════════════════
   Live fully. Die ready.
═══════════════════════════════════════════════════
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinalPlaybook_${user.firstName}_${user.lastName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInterimSummary = () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const summary = `═══════════════════════════════════════════════════
       LEGACY PATH · INTERIM SUMMARY
   Legacy Readiness OS · Powered by Endevo
═══════════════════════════════════════════════════

Member:        ${user.firstName} ${user.lastName}
Generated:     ${today}

Overall readiness:   ${progress}%
Modules completed:   ${completedModules.length}
Modules in progress: ${inProgressModules.length}
Time invested:       ${hoursInvested.toFixed(1)} hours
Assessment score:    ${employee?.assessmentScore ? `${employee.assessmentScore}/10` : 'Not yet taken'}

Completed modules
${completedModules.length === 0
  ? '  (none yet — your journey is just beginning)'
  : completedModules
      .map((p) => {
        const m = mockModules.find((mod) => mod.id === p.moduleId);
        const date = p.completedAt ? new Date(p.completedAt).toLocaleDateString() : '';
        return `  ✓ ${m?.title ?? p.moduleId}  ·  ${date}`;
      })
      .join('\n')}

In progress
${inProgressModules.length === 0
  ? '  (nothing currently open)'
  : inProgressModules
      .map((p) => {
        const m = mockModules.find((mod) => mod.id === p.moduleId);
        return `  ◆ ${m?.title ?? p.moduleId}  ·  ${p.progressPercentage}%`;
      })
      .join('\n')}

═══════════════════════════════════════════════════
  This is your journey so far. The Final Playbook
  compiles itself once each domain is complete.
═══════════════════════════════════════════════════
`;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LegacyPath_InterimSummary_${user.firstName}_${user.lastName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isComplete = sectionsReady === 4;
  const isLocked = sectionsReady === 0;

  return (
    <DashboardLayout title="Final Playbook" role="org_member">
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
              Your Final Playbook
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
                {isLocked ? 'Locked — begin the path' : isComplete ? 'Download Final Playbook' : 'Download partial preview'}
              </button>
              <button
                onClick={handleInterimSummary}
                className="lr-btn-outline"
                style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}
              >
                Export interim summary
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
          The Final Playbook is generated entirely from the lessons you complete. It contains no PHI or PII you
          haven't entered yourself, and it is never visible to your employer, to XYZ Company, or to Endevo.
        </p>
      </div>
    </DashboardLayout>
  );
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
