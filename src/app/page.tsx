'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LRMonogram from '@/components/common/LRMonogram';

interface Persona {
  email: string;
  firstName: string;
  lastName: string;
  roleLabel: string;
  context: string;
  blurb: string;
  badge?: string;
  variant: 'member' | 'org_admin' | 'super_admin';
  metric?: { label: string; value: string };
}

const PERSONAS: Persona[] = [
  {
    email: 'jennifer.chen@xyzcompany.com',
    firstName: 'Jennifer',
    lastName: 'Chen',
    roleLabel: 'Org Admin',
    context: 'XYZ Company',
    blurb: 'Aggregated readiness analytics across her workforce. Privacy-first — never sees individual answers.',
    badge: 'Demo · Org Admin view',
    variant: 'org_admin',
    metric: { label: 'Members', value: '4 of 4' },
  },
  {
    email: 'sarah.mitchell@xyzcompany.com',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    roleLabel: 'Member · Advanced',
    context: 'Caregiver Solutions, XYZ Company',
    blurb: 'Mid-journey through her Legacy Path. Three of four domains active, FinalPlaybook within reach.',
    variant: 'member',
    metric: { label: 'Readiness', value: '78%' },
  },
  {
    email: 'marcus.reed@xyzcompany.com',
    firstName: 'Marcus',
    lastName: 'Reed',
    roleLabel: 'Member · In Progress',
    context: 'Chronic Disease, XYZ Company',
    blurb: 'Working through Financial domain. Streak of 4 days. Demonstrates the gamified middle of the path.',
    variant: 'member',
    metric: { label: 'Readiness', value: '35%' },
  },
  {
    email: 'aisha.patel@xyzcompany.com',
    firstName: 'Aisha',
    lastName: 'Patel',
    roleLabel: 'Member · Day One',
    context: 'Caregiver Solutions, XYZ Company',
    blurb: 'Brand-new member. Sees onboarding, assessment, and the moment she earns her first XP.',
    variant: 'member',
    metric: { label: 'Readiness', value: '0%' },
  },
  {
    email: 'nermeen@endevo.life',
    firstName: 'Nermeen',
    lastName: 'Khan',
    roleLabel: 'Super Admin',
    context: 'Endevo Platform',
    blurb: 'Multi-tenant view across every employer running Legacy Readiness OS — XYZ Company, Innovate Labs, Northstar.',
    variant: 'super_admin',
    metric: { label: 'Tenants', value: '3 active' },
  },
];

export default function Home() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin') router.push('/superadmin/dashboard');
      else if (user.role === 'org_admin') router.push('/org/admin/dashboard');
      else if (user.role === 'org_member') router.push('/org/member/dashboard');
    }
  }, [user, router]);

  // Honor saved theme preference on landing too — otherwise the
  // page would always render in dark even if the user picked light.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('lr_theme');
    if (saved === 'light' || saved === 'dark') {
      document.body.setAttribute('data-theme', saved);
    }
  }, []);

  const handlePersonaClick = (persona: Persona) => {
    setPending(persona.email);
    login(persona.email);
  };

  const accentByVariant: Record<Persona['variant'], string> = {
    org_admin: 'var(--lr-gold)',
    member: 'var(--lr-gold-pale)',
    super_admin: 'var(--lr-pearl)',
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top, var(--lr-navy-mid) 0%, var(--lr-midnight) 55%, var(--lr-navy-deep) 100%)',
      }}
    >
      {/* Decorative concentric rings — Eternal Geometry signature */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]">
        <div
          className="rounded-full"
          style={{
            width: '120vh',
            height: '120vh',
            border: '1px solid var(--lr-gold)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '90vh',
            height: '90vh',
            border: '1px solid var(--lr-gold)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '60vh',
            height: '60vh',
            border: '1px solid var(--lr-gold)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '32vh',
            height: '32vh',
            border: '1px solid var(--lr-gold)',
          }}
        />
      </div>

      {/* Top brand strip — date marker only; brand mark lives in the hero */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-10 flex items-center justify-end">
        <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.32em] uppercase text-(--lr-gold-soft)">
          Demo Environment · April 2026
        </p>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6 pb-14">
        {/* Hero — round monogram on top, name + tagline below */}
        <div className="flex flex-col items-center text-center mb-14">
          <LRMonogram size={160} priority />

          <div className="mt-5">
            <LRMonogram variant="lockup" size={64} />
          </div>

          <p className="lr-eyebrow mt-5" style={{ color: 'var(--lr-gold-soft)' }}>
            01 Legal · 02 Financial · 03 Digital · 04 Physical
          </p>

          <p className="font-(family-name:--font-jura) text-(--lr-pearl) tracking-[0.08em] text-base max-w-xl mx-auto leading-relaxed mt-4">
            Where readiness becomes permanence,<br />and order becomes legacy.
          </p>

          <hr className="lr-separator mt-7 max-w-sm w-full" />
        </div>

        {/* Persona picker */}
        <div className="mb-8 text-center">
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Select a Demo Persona
          </p>
          <h2 className="font-(family-name:--font-italiana) text-2xl text-(--lr-gold) tracking-[0.08em] mt-2">
            FIVE WINDOWS INTO THE PLATFORM
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((p) => {
            const isHovered = hovered === p.email;
            const isPending = pending === p.email;
            return (
              <button
                key={p.email}
                onClick={() => handlePersonaClick(p)}
                onMouseEnter={() => setHovered(p.email)}
                onMouseLeave={() => setHovered(null)}
                disabled={!!pending}
                className="group relative text-left rounded-[14px] p-6 transition-all duration-300 overflow-hidden"
                style={{
                  background:
                    'linear-gradient(180deg, var(--lr-navy-mid) 0%, var(--lr-navy-deep) 100%)',
                  border: isHovered
                    ? '1px solid var(--lr-gold)'
                    : '1px solid var(--border-gold)',
                  boxShadow: isHovered
                    ? '0 24px 60px -28px rgba(212,190,148,0.35)'
                    : '0 12px 32px -22px rgba(0,0,0,0.18)',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                {/* Top row: avatar + metric */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-(family-name:--font-jura) text-sm tracking-wider"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-midnight) 100%)',
                      color: accentByVariant[p.variant],
                      border: '1px solid rgba(212,190,148,0.4)',
                    }}
                  >
                    {p.firstName[0]}
                    {p.lastName[0]}
                  </div>

                  {p.metric && (
                    <div className="text-right">
                      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.2em] uppercase text-(--lr-gold-soft)">
                        {p.metric.label}
                      </p>
                      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-base mt-0.5">
                        {p.metric.value}
                      </p>
                    </div>
                  )}
                </div>

                {/* Name + role */}
                <p className="font-(family-name:--font-italiana) text-2xl tracking-[0.04em] text-(--lr-pearl) leading-tight">
                  {p.firstName} {p.lastName}
                </p>
                <p className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.2em] uppercase mt-1.5 text-(--lr-gold)">
                  {p.roleLabel}
                </p>
                <p className="text-[0.7rem] text-(--lr-lavender-dust) mt-1">{p.context}</p>

                <hr className="lr-separator my-5" />

                <p className="text-sm text-(--lr-pearl) leading-relaxed opacity-90">{p.blurb}</p>

                {p.badge && (
                  <div className="mt-5 inline-block">
                    <span
                      className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
                      style={{
                        color: 'var(--lr-navy-deep)',
                        background: 'var(--lr-gold)',
                      }}
                    >
                      {p.badge}
                    </span>
                  </div>
                )}

                {/* CTA chevron */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.22em] uppercase text-(--lr-gold)">
                    {isPending ? 'Loading…' : 'Enter as ' + p.firstName}
                  </span>
                  <span
                    className="text-(--lr-gold) transition-transform duration-300"
                    style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}
                  >
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-14 text-center">
          <hr className="lr-separator max-w-md mx-auto mb-5" />
          <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase text-(--lr-gold-soft)">
            Eternal Geometry · v3.0
          </p>
          <p className="text-xs text-(--lr-lavender-dust) mt-2 leading-relaxed max-w-md mx-auto">
            This is a private demo environment. No PHI or PII is captured. Click any persona to enter the
            corresponding view.
          </p>
        </div>
      </div>
    </div>
  );
}
