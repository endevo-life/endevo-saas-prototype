'use client';

/**
 * v2 AppShell — three-pane app shell (UX_REDESIGN.md §3.2).
 *   Left rail (~200px) · center (flex) · right docker (~260px)
 *
 * Fully self-contained: inline styles + the shell tokens from domainColors.ts.
 * Shares nothing with the prototype's DashboardLayout. Safe to delete by
 * removing the /v2 folder.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { buildJourney } from './journey';
import { domainColors, shell, type DomainKey } from './domainColors';
import { mockEmployees } from '@/lib/mock-data';

export interface Crumb {
  label: string;
  href?: string;
}

export default function AppShell({
  crumbs,
  children,
  rightDocker,
}: {
  crumbs: Crumb[];
  children: React.ReactNode;
  rightDocker?: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const employee = mockEmployees.find((e) => e.id === user?.id) ?? mockEmployees[0];
  const journey = buildJourney(employee?.progressPercentage ?? 0);
  const initials = `${user?.firstName?.[0] ?? 'S'}${user?.lastName?.[0] ?? 'M'}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: shell.bg,
        color: shell.text,
        fontFamily: 'var(--font-jura), Inter, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <header
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 24px',
          borderBottom: `1px solid ${shell.border}`,
          flexShrink: 0,
        }}
      >
        <Link href="/v2" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: `2px solid ${domainColors.legal.base}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: domainColors.legal.base }} />
          </span>
          <span style={{ color: domainColors.legal.base, letterSpacing: '0.18em', fontSize: 13, textTransform: 'lowercase' }}>
            Legacy readiness os
          </span>
        </Link>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 24, fontSize: 14 }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <span style={{ color: shell.textFaint }}>›</span>}
              {c.href ? (
                <Link href={c.href} style={{ color: shell.textDim, textDecoration: 'none' }}>
                  {c.label}
                </Link>
              ) : (
                <span style={{ color: shell.text, fontWeight: 600 }}>{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: shell.textDim, fontSize: 13 }}>v2 preview</span>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: `1px solid ${shell.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: shell.textDim,
            }}
          >
            {initials}
          </span>
        </div>
      </header>

      {/* Body: rail | center | docker */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* LEFT RAIL */}
        <aside
          style={{
            width: 210,
            flexShrink: 0,
            borderRight: `1px solid ${shell.border}`,
            padding: '24px 16px',
            overflowY: 'auto',
          }}
        >
          <p style={{ ...eyebrow, marginBottom: 16 }}>My path</p>

          <RailLink href="/v2" label="Today" active={pathname === '/v2'} />

          <div style={{ height: 16 }} />

          {journey.map((d) => {
            const active = pathname?.startsWith(`/v2/${d.key}`);
            const color = domainColors[d.key as DomainKey].base;
            const done = d.completeCount === d.totalCount && d.totalCount > 0;
            return (
              <Link
                key={d.key}
                href={`/v2/${d.key}`}
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: 10,
                  marginBottom: 4,
                  textDecoration: 'none',
                  background: active ? domainColors[d.key as DomainKey].tint : 'transparent',
                  border: active ? `1px solid ${domainColors[d.key as DomainKey].border}` : '1px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: done || active ? color : 'transparent',
                      border: `1.5px solid ${color}`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: active ? shell.text : shell.textDim, fontSize: 14, fontWeight: active ? 600 : 400 }}>
                    {d.label}
                  </span>
                </div>
                <span style={{ color: shell.textFaint, fontSize: 11, marginLeft: 19 }}>
                  {d.completeCount} of {d.totalCount}
                </span>
              </Link>
            );
          })}

          <div style={{ height: 24, borderTop: `1px solid ${shell.border}`, marginTop: 16 }} />
          <RailLink href="/org/member/path" label="← Back to current prototype" muted />
        </aside>

        {/* CENTER */}
        <main style={{ flex: 1, minWidth: 0, padding: '32px 40px', overflowY: 'auto' }}>{children}</main>

        {/* RIGHT DOCKER */}
        {rightDocker && (
          <aside
            style={{
              width: 280,
              flexShrink: 0,
              borderLeft: `1px solid ${shell.border}`,
              padding: '24px 20px',
              overflowY: 'auto',
            }}
          >
            {rightDocker}
          </aside>
        )}
      </div>
    </div>
  );
}

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: shell.textFaint,
};

function RailLink({ href, label, active, muted }: { href: string; label: string; active?: boolean; muted?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '10px 12px',
        borderRadius: 10,
        textDecoration: 'none',
        fontSize: muted ? 12 : 14,
        fontWeight: active ? 600 : 400,
        color: muted ? shell.textFaint : active ? shell.text : shell.textDim,
        background: active ? shell.panelRaised : 'transparent',
        border: active ? `1px solid ${shell.border}` : '1px solid transparent',
      }}
    >
      {label}
    </Link>
  );
}

export { eyebrow };
