'use client';

/** L2 — Domain view (UX_REDESIGN.md §5.2). Milestone cards for one domain. */

import Link from 'next/link';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { mockEmployees } from '@/lib/mock-data';
import AppShell from '../AppShell';
import { PeaceOfMind, AdvisorStub } from '../widgets';
import { buildJourney, findDomain, type Milestone, type MilestoneStatus } from '../journey';
import { domainColors, shell, type DomainKey } from '../domainColors';

export default function DomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: domainKey } = use(params);
  const { user } = useAuth();
  const employee = mockEmployees.find((e) => e.id === user?.id) ?? mockEmployees[0];
  const progress = employee?.progressPercentage ?? 78;
  const journey = buildJourney(progress);
  const domain = findDomain(journey, domainKey);

  if (!domain) notFound();

  const color = domainColors[domain.key as DomainKey].base;
  const pct = domain.totalCount ? (domain.completeCount / domain.totalCount) * 100 : 0;
  const remaining = domain.milestones
    .filter((m) => m.status !== 'complete')
    .reduce((sum, m) => sum + (parseInt(m.duration) || 10), 0);

  return (
    <AppShell
      crumbs={[{ label: 'My path', href: '/v2' }, { label: domain.label }]}
      rightDocker={
        <>
          <PeaceOfMind score={Math.round(progress)} />
          <AdvisorStub />
        </>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, fontFamily: 'var(--font-italiana), Georgia, serif', color: shell.text }}>
          {domain.label}
        </h1>
      </div>
      <p style={{ color: shell.textDim, marginTop: 8, fontSize: 15 }}>
        {domain.completeCount} of {domain.totalCount} milestones complete · about {remaining} min left
      </p>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 3, background: '#1e293b', marginTop: 16, marginBottom: 28 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color }} />
      </div>

      {/* Milestone cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {domain.milestones.map((m) => (
          <MilestoneCard key={m.id} domainKey={domain.key} milestone={m} color={color} />
        ))}
      </div>

      <p style={{ color: shell.textFaint, fontSize: 13, marginTop: 28, fontStyle: 'italic' }}>
        Take it at your pace. You can revisit any milestone.
      </p>
    </AppShell>
  );
}

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  complete: 'Complete',
  current: 'In progress',
  available: 'Available',
  locked: 'Locked',
};

function MilestoneCard({ domainKey, milestone, color }: { domainKey: string; milestone: Milestone; color: string }) {
  const locked = milestone.status === 'locked';
  const current = milestone.status === 'current';
  const complete = milestone.status === 'complete';

  const inner = (
    <div
      style={{
        background: current ? domainColors[domainKey as DomainKey].tint : shell.panel,
        border: current ? `1px solid ${color}` : `1px solid ${shell.border}`,
        borderRadius: 14,
        padding: 22,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        opacity: locked ? 0.55 : 1,
      }}
    >
      {/* Status dot */}
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: complete ? color : 'transparent',
          border: `2px solid ${complete || current ? color : shell.textFaint}`,
          color: complete ? domainColors[domainKey as DomainKey].onColor : color,
          fontSize: 16,
        }}
      >
        {complete ? '✓' : current ? '●' : ''}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...eyebrow, color: current ? color : shell.textFaint }}>
          {milestone.label} · {STATUS_LABEL[milestone.status]}
        </p>
        <h3 style={{ margin: '4px 0', fontSize: 17, fontWeight: 600, color: shell.text }}>{milestone.title}</h3>
        <p style={{ color: shell.textFaint, fontSize: 13, margin: 0 }}>
          {milestone.videoCount ? `${milestone.videoCount} video · ` : ''}
          {milestone.worksheetCount} worksheet · {milestone.duration}
        </p>
      </div>

      {!locked && (
        <span
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            background: current ? color : 'transparent',
            border: current ? 'none' : `1px solid ${shell.border}`,
            color: current ? domainColors[domainKey as DomainKey].onColor : shell.textDim,
            fontWeight: 600,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {complete ? 'Review' : 'Open'}
        </span>
      )}
    </div>
  );

  if (locked) return inner;
  return (
    <Link href={`/v2/${domainKey}/${milestone.id}`} style={{ textDecoration: 'none' }}>
      {inner}
    </Link>
  );
}

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: shell.textFaint,
  margin: 0,
};
