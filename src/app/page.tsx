'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LRMonogram from '@/components/common/LRMonogram';
import Image from 'next/image';

interface Persona {
  email: string;
  label: string;
  sublabel: string;
  variant: 'member' | 'org_admin' | 'super_admin';
}

const PERSONAS: Persona[] = [
  {
    email: 'jennifer.chen@xyzcompany.com',
    label: 'Jennifer Chen — HR Admin',
    sublabel: 'XYZ Company · Org Admin view',
    variant: 'org_admin',
  },
  {
    email: 'sarah.mitchell@xyzcompany.com',
    label: 'Sarah Mitchell — Member (Advanced)',
    sublabel: 'XYZ Company · 78% readiness',
    variant: 'member',
  },
  {
    email: 'marcus.reed@xyzcompany.com',
    label: 'Marcus Reed — Member (In Progress)',
    sublabel: 'XYZ Company · 35% readiness',
    variant: 'member',
  },
  {
    email: 'aisha.patel@xyzcompany.com',
    label: 'Aisha Patel — Member (Day One)',
    sublabel: 'XYZ Company · Brand new',
    variant: 'member',
  },
  {
    email: 'nermeen@endevo.life',
    label: 'Nermeen Khan — Super Admin',
    sublabel: 'Endevo Platform · 3 tenants',
    variant: 'super_admin',
  },
];

const STATS = [
  { value: '74%', label: 'Average enrollment rate in pilot cohorts' },
  { value: '4',   label: 'Life domains: Legal, Financial, Digital, Physical' },
  { value: '141', label: 'Members reached "Protected" status in first cohort' },
  { value: '0',   label: 'Individual answers visible to employers — ever' },
];

const PILLARS = [
  {
    icon: '◆',
    title: 'Privacy by design',
    body: 'HR sees only aggregate readiness metrics. Individual answers, reflections, and the FinalPlaybook are never visible to employers or to Endevo.',
  },
  {
    icon: '◈',
    title: 'Measurable workforce readiness',
    body: 'Track legacy readiness as an HR KPI. Department-level breakdowns, funnel analytics, and a clear path from "at risk" to "protected."',
  },
  {
    icon: '◇',
    title: 'Deploys in days',
    body: 'No IT lift. Employees access Legacy Readiness OS through their existing benefits portal. Bulk invite via CSV gets a cohort enrolled in minutes.',
  },
  {
    icon: '○',
    title: 'Education-first, not document storage',
    body: 'LRos guides employees through action items across Legal, Financial, Digital, and Physical domains — compiling the FinalPlaybook as they go.',
  },
];

export default function Home() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('lr_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });
  const [selected, setSelected] = useState<string>('');
  const [pending, setPending] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin') router.push('/superadmin/dashboard');
      else if (user.role === 'org_admin') router.push('/org/admin/dashboard');
      else if (user.role === 'org_member') router.push('/org/member/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('lr_theme', next);
  };

  const handleEnter = () => {
    if (!selected || pending) return;
    setPending(true);
    login(selected);
  };

  const selectedPersona = PERSONAS.find((p) => p.email === selected);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background: 'var(--lr-midnight)',
      }}
    >
      {/* Top bar */}
      <header className="relative z-10 w-full px-8 pt-7 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LRMonogram size={52} priority themeMode={theme} />
          <LRMonogram variant="lockup" size={20} priority themeMode={theme} />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: 'var(--lr-gold)',
              border: '1px solid var(--border-gold)',
              background: 'rgba(212,190,148,0.05)',
            }}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" strokeWidth={1.6} />
                <path strokeLinecap="round" strokeWidth={1.6} d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <a
            href="https://link.endevo.life/widget/bookings/time-with-niki"
            target="_blank"
            rel="noopener noreferrer"
            className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.18em] uppercase px-4 py-2 rounded-lg transition-all"
            style={{
              color: 'var(--lr-navy-deep)',
              background: 'var(--lr-gold)',
            }}
          >
            Book a call with Niki →
          </a>
        </div>
      </header>

      {/* Main two-column layout */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch max-w-7xl mx-auto w-full px-8 py-12 gap-12">

        {/* ── LEFT: Sales pitch ── */}
        <div className="flex-1 flex flex-col justify-center max-w-xl">

          {/* Eyebrow */}
          <p className="lr-eyebrow mb-4" style={{ color: 'var(--lr-gold-soft)' }}>
            Employee Benefit · B2B SaaS
          </p>

          {/* Headline */}
          <h1
            className="font-(family-name:--font-italiana) leading-[1.08] tracking-[0.03em] mb-6 font-bold"
            style={{ fontSize: 'clamp(2.45rem, 4.4vw, 3.8rem)', color: 'var(--lr-gold)' }}
          >
            Your employees<br />deserve to be ready.
          </h1>

          {/* Sub-headline */}
          <p className="font-(family-name:--font-jura) text-(--lr-pearl) tracking-[0.04em] text-lg leading-relaxed mb-8 opacity-95">
            Legacy Readiness OS is an HR benefit that guides your workforce through
            the legal, financial, digital, and physical decisions they&apos;ve been
            putting off — before a crisis forces their hand.
          </p>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-xl px-4 py-4"
                style={{
                  background: 'rgba(212,190,148,0.04)',
                  border: '1px solid var(--border-gold)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-(--lr-gold) text-base leading-none">{p.icon}</span>
                  <p className="font-(family-name:--font-jura) text-[0.78rem] tracking-[0.14em] uppercase text-(--lr-gold) font-semibold">
                    {p.title}
                  </p>
                </div>
                <p className="text-sm text-(--lr-lavender-dust) leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {STATS.map((s) => (
              <div key={s.value} className="text-center">
                <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-[1.8rem] leading-none font-semibold">
                  {s.value}
                </p>
                <p className="text-[0.78rem] text-(--lr-lavender-dust) leading-snug mt-1.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <hr className="lr-separator mb-6" />

          <p className="text-sm text-(--lr-lavender-dust) leading-relaxed">
            Trusted by HR leaders at companies ranging from 25 to 375+ employees.
            Pilot programs available Q2 2026.{' '}
            <a
              href="https://link.endevo.life/widget/bookings/time-with-niki"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--lr-gold) underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Contact Niki to get started.
            </a>
          </p>
        </div>

        {/* ── RIGHT: Login panel ── */}
        <div className="lg:w-105 flex flex-col justify-center">
          <div
            className="rounded-[20px] p-8 flex flex-col gap-6"
            style={{
              background:
                'linear-gradient(180deg, var(--lr-navy-mid) 0%, var(--lr-navy-deep) 100%)',
              border: '1px solid var(--border-gold)',
              boxShadow: '0 32px 80px -32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Panel header */}
            <div className="text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <LRMonogram size={68} themeMode={theme} priority />
                <LRMonogram variant="lockup" size={30} themeMode={theme} priority />
              </div>
              <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-[1.95rem] tracking-[0.02em] mt-4 font-bold">
                Platform Access
              </p>
              <p className="font-(family-name:--font-jura) text-[0.74rem] tracking-[0.14em] uppercase text-(--lr-gold-soft) mt-1">
                Interactive Demo Environment
              </p>
            </div>

            <hr className="lr-separator" />

            {/* Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="font-(family-name:--font-jura) text-[0.74rem] tracking-[0.16em] uppercase text-(--lr-gold-soft) font-semibold">
                Select a persona to explore
              </label>

              {/* Custom dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-full text-left px-4 py-3.5 rounded-[10px] transition-all flex items-center justify-between gap-3"
                  style={{
                    background: 'rgba(212,190,148,0.06)',
                    border: dropdownOpen
                      ? '1px solid var(--lr-gold)'
                      : '1px solid var(--border-gold)',
                    color: selectedPersona ? 'var(--lr-pearl)' : 'var(--lr-lavender-dust)',
                  }}
                >
                  <div className="min-w-0">
                    {selectedPersona ? (
                      <>
                        <p className="text-base font-(family-name:--font-jura) tracking-[0.02em] truncate font-semibold">
                          {selectedPersona.label}
                        </p>
                        <p className="text-[0.65rem] text-(--lr-gold-soft) tracking-[0.14em] mt-0.5 truncate">
                          {selectedPersona.sublabel}
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-(family-name:--font-jura) tracking-[0.02em]">
                        Choose who you want to be…
                      </p>
                    )}
                  </div>
                  <span
                    className="text-(--lr-gold) text-xs shrink-0 transition-transform duration-200"
                    style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    ▾
                  </span>
                </button>

                {/* Dropdown list */}
                {dropdownOpen && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 rounded-[10px] overflow-hidden z-20"
                    style={{
                      background: 'var(--lr-navy-deep)',
                      border: '1px solid var(--lr-gold)',
                      boxShadow: '0 16px 40px -16px rgba(0,0,0,0.6)',
                    }}
                  >
                    {PERSONAS.map((p, i) => (
                      <button
                        key={p.email}
                        type="button"
                        onClick={() => {
                          setSelected(p.email);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 transition-colors hover:bg-white/5 flex items-center gap-3"
                        style={{
                          borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                          background: selected === p.email ? 'rgba(212,190,148,0.08)' : undefined,
                        }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-(family-name:--font-jura) text-xs tracking-wider"
                          style={{
                            background: 'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-midnight) 100%)',
                            color: p.variant === 'super_admin' ? 'var(--lr-pearl)' : 'var(--lr-gold)',
                            border: '1px solid rgba(212,190,148,0.35)',
                          }}
                        >
                          {p.label.split(' ')[0][0]}{p.label.split(' ')[1][0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-(--lr-pearl) truncate font-(family-name:--font-jura) tracking-[0.04em]">
                            {p.label}
                          </p>
                          <p className="text-[0.65rem] text-(--lr-gold-soft) truncate mt-0.5">
                            {p.sublabel}
                          </p>
                        </div>
                        {selected === p.email && (
                          <span className="text-(--lr-gold) text-xs shrink-0 ml-auto">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enter button */}
            <button
              onClick={handleEnter}
              disabled={!selected || pending}
              className="w-full py-3.5 rounded-[10px] font-(family-name:--font-jura) text-[0.84rem] tracking-[0.16em] uppercase transition-all font-semibold"
              style={{
                background: selected && !pending ? 'var(--lr-gold)' : 'rgba(212,190,148,0.2)',
                color: selected && !pending ? 'var(--lr-navy-deep)' : 'var(--lr-lavender-dust)',
                cursor: selected && !pending ? 'pointer' : 'not-allowed',
              }}
            >
              {pending ? 'Entering platform…' : 'Enter platform →'}
            </button>

            {/* Persona description — shows after selection */}
            {selectedPersona && (
              <div
                className="rounded-[10px] px-4 py-3"
                style={{
                  background: 'rgba(212,190,148,0.04)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {selectedPersona.variant === 'org_admin' && (
                  <p className="text-sm text-(--lr-lavender-dust) leading-relaxed">
                    <span className="text-(--lr-gold)">HR Admin view</span> — aggregate workforce readiness analytics, member roster management, and department-level breakdowns. Never sees individual answers.
                  </p>
                )}
                {selectedPersona.variant === 'member' && (
                  <p className="text-sm text-(--lr-lavender-dust) leading-relaxed">
                    <span className="text-(--lr-gold)">Employee view</span> — personal Legacy Path, domain assessments, learning modules, and FinalPlaybook. Fully private to the member.
                  </p>
                )}
                {selectedPersona.variant === 'super_admin' && (
                  <p className="text-sm text-(--lr-lavender-dust) leading-relaxed">
                    <span className="text-(--lr-gold)">Platform operator view</span> — multi-tenant management across all employer accounts, audit logs, and platform health.
                  </p>
                )}
              </div>
            )}

            <p className="text-center text-[0.78rem] text-(--lr-lavender-dust) leading-relaxed">
              Private demo environment · No PHI or PII captured<br />
              <span className="text-(--lr-gold-soft)">Legacy Readiness OS · Powered by Endevo</span>
            </p>
          </div>

          {/* Below card: call to action */}
          <div className="mt-6 text-center">
            <p className="text-sm text-(--lr-lavender-dust)">
              Interested in offering this as an employee benefit?
            </p>
            <a
              href="https://link.endevo.life/widget/bookings/time-with-niki"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 font-(family-name:--font-jura) text-[0.7rem] tracking-[0.18em] uppercase text-(--lr-gold) hover:opacity-75 transition-opacity"
            >
              Schedule a pilot conversation →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-8 py-5 border-t border-(--border-subtle)">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <a
            href="https://endevo.life"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit ENDevo.life website"
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <span className="text-[0.72rem] text-(--lr-lavender-dust)">Powered by</span>
            <Image
              src="/asset/endevo-logo-xlarge.png"
              alt="ENDevo"
              width={180}
              height={40}
              className="h-8 w-auto"
            />
          </a>

          <div className="text-center md:text-right">
            <p className="text-[0.74rem] text-(--lr-lavender-dust)">© 2026 ENDevo · All rights reserved</p>
            <div className="mt-0.5 flex items-center justify-center md:justify-end gap-2 text-[0.74rem]">
              <a
                href="https://endevo.life"
                target="_blank"
                rel="noopener noreferrer"
                title="ENDevo official website"
                className="text-(--lr-gold-soft) hover:text-(--lr-gold) transition-colors"
              >
                ENDevo.life
              </a>
              <span className="text-(--lr-lavender-dust)">·</span>
              <a
                href="https://endevo.life/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                title="Read ENDevo privacy policy"
                className="text-(--lr-gold-soft) hover:text-(--lr-gold) transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
