'use client';

/** L1 — Today / My Path (UX_REDESIGN.md §5.1). */

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockEmployees } from '@/lib/mock-data';
import AppShell from './AppShell';
import { PeaceOfMind, AdvisorStub } from './widgets';
import { buildJourney, resumePoint } from './journey';
import { domainColors, shell, type DomainKey } from './domainColors';

export default function TodayPage() {
  const { user } = useAuth();
  const employee = mockEmployees.find((e) => e.id === user?.id) ?? mockEmployees[0];
  const progress = employee?.progressPercentage ?? 78;
  const journey = buildJourney(progress);
  const resume = resumePoint(journey);

  return (
    <AppShell
      crumbs={[{ label: 'My path' }]}
      rightDocker={
        <>
          <PeaceOfMind score={Math.round(progress)} />
          <AdvisorStub />
        </>
      }
    >
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, fontFamily: 'var(--font-italiana), Georgia, serif', color: shell.text }}>
        Hello, {user?.firstName ?? 'Sarah'}
      </h1>
      <p style={{ color: shell.textDim, marginTop: 6, fontSize: 15 }}>
        Welcome back. Continue where you left off.
      </p>

      {/* Continue card */}
      {resume && (
        <Link href={`/v2/${resume.domain.key}/${resume.milestone.id}`} style={{ textDecoration: 'none' }}>
          <div
            style={{
              marginTop: 24,
              background: shell.panel,
              border: `1px solid ${domainColors[resume.domain.key].border}`,
              borderRadius: 16,
              padding: 28,
            }}
          >
            <p style={{ ...eyebrow, color: domainColors[resume.domain.key].base }}>
              Continue where you left off
            </p>
            <h2 style={{ margin: '10px 0', fontSize: 22, fontWeight: 600, color: shell.text }}>
              {resume.milestone.label} · {resume.milestone.title}
            </h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <Pill>{resume.milestone.videoCount || 1} video</Pill>
              <Pill>{resume.milestone.worksheetCount} worksheet</Pill>
              <Pill>{resume.milestone.duration}</Pill>
            </div>
            <span
              style={{
                display: 'inline-block',
                marginTop: 18,
                padding: '10px 20px',
                borderRadius: 999,
                background: domainColors[resume.domain.key].base,
                color: domainColors[resume.domain.key].onColor,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Continue →
            </span>
          </div>
        </Link>
      )}

      {/* Domain cards */}
      <p style={{ ...eyebrow, marginTop: 36 }}>All domains</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginTop: 14 }}>
        {journey.map((d) => {
          const color = domainColors[d.key as DomainKey].base;
          const pct = d.totalCount ? (d.completeCount / d.totalCount) * 100 : 0;
          return (
            <Link key={d.key} href={`/v2/${d.key}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: shell.panel,
                  border: `1px solid ${shell.border}`,
                  borderRadius: 14,
                  padding: 20,
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <span style={{ color: shell.text, fontWeight: 600, fontSize: 16 }}>{d.label}</span>
                </div>
                <p style={{ color: shell.textFaint, fontSize: 13, margin: '12px 0 14px' }}>
                  {d.completeCount} of {d.totalCount} milestones
                </p>
                <div style={{ height: 5, borderRadius: 3, background: '#1e293b' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p style={{ color: shell.textFaint, fontSize: 13, marginTop: 32, fontStyle: 'italic' }}>
        Take it at your pace. Nothing here is going anywhere.
      </p>
    </AppShell>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: '6px 14px',
        borderRadius: 999,
        background: '#0b1120',
        border: `1px solid ${shell.border}`,
        color: shell.textDim,
        fontSize: 13,
      }}
    >
      {children}
    </span>
  );
}

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: shell.textFaint,
  margin: 0,
};
