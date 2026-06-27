'use client';

/**
 * L3 — Milestone view (UX_REDESIGN.md §5.3). The most important screen:
 * center = video + playlist, right docker = Worksheet / Notes / Advisor tabs.
 *
 * Auto-save is simulated locally (no backend) — this is a static redesign
 * preview, so worksheet state lives in component state with a "Saved" stamp.
 */

import Link from 'next/link';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { mockEmployees } from '@/lib/mock-data';
import AppShell from '../../AppShell';
import { buildJourney, findDomain, findMilestone } from '../../journey';
import { domainColors, shell, type DomainKey } from '../../domainColors';
import type { Resource } from '@/lib/module-content';

type Tab = 'worksheet' | 'notes' | 'advisor';

export default function MilestonePage({
  params,
}: {
  params: Promise<{ domain: string; milestoneId: string }>;
}) {
  const { domain: domainKey, milestoneId } = use(params);
  const { user } = useAuth();
  const employee = mockEmployees.find((e) => e.id === user?.id) ?? mockEmployees[0];
  const journey = buildJourney(employee?.progressPercentage ?? 78);
  const domain = findDomain(journey, domainKey);
  const milestone = domain ? findMilestone(domain, milestoneId) : undefined;

  const [tab, setTab] = useState<Tab>('worksheet');

  if (!domain || !milestone) notFound();

  const color = domainColors[domain.key as DomainKey].base;
  const lesson = milestone.lesson;
  const resources: Resource[] = lesson.resources ?? (lesson.externalUrl ? [{ kind: 'tool', label: 'Open activity', url: lesson.externalUrl }] : []);

  return (
    <AppShell
      crumbs={[
        { label: 'My path', href: '/v2' },
        { label: domain.label, href: `/v2/${domain.key}` },
        { label: `${milestone.label} — ${milestone.title}` },
      ]}
      rightDocker={<Docker tab={tab} setTab={setTab} color={color} resources={resources} />}
    >
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, fontFamily: 'var(--font-italiana), Georgia, serif', color: shell.text }}>
        {milestone.title}
      </h1>
      <p style={{ color: shell.textDim, marginTop: 6, fontSize: 14 }}>
        {domain.label} · {milestone.label} · {milestone.videoCount ? `${milestone.videoCount} video · ` : ''}
        {milestone.worksheetCount} worksheet · {milestone.duration}
      </p>

      {/* Video */}
      <div
        style={{
          marginTop: 24,
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${shell.border}`,
          background: '#060a14',
          aspectRatio: '16 / 9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {lesson.driveId ? (
          <iframe
            src={`https://drive.google.com/file/d/${lesson.driveId}/preview`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay"
            allowFullScreen
            title={lesson.title}
          />
        ) : (
          <span style={{ ...eyebrow }}>Worksheet-only milestone · no video</span>
        )}
      </div>

      {/* Playlist (this milestone's siblings) */}
      <p style={{ ...eyebrow, marginTop: 24 }}>Playlist · plays in order</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        {domain.milestones.map((m, i) => {
          const isActive = m.id === milestone.id;
          return (
            <Link
              key={m.id}
              href={`/v2/${domain.key}/${m.id}`}
              style={{
                textDecoration: 'none',
                width: 150,
                padding: 12,
                borderRadius: 12,
                background: isActive ? domainColors[domain.key as DomainKey].tint : shell.panel,
                border: isActive ? `1px solid ${color}` : `1px solid ${shell.border}`,
              }}
            >
              <div style={{ fontSize: 22, color: isActive ? color : shell.textFaint, textAlign: 'center' }}>▶</div>
              <p style={{ ...eyebrow, marginTop: 8, textAlign: 'center', color: isActive ? color : shell.textFaint }}>
                {i + 1} · {m.title.split('·').pop()?.trim().slice(0, 16) ?? m.label}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Mark complete */}
      <button
        type="button"
        style={{
          marginTop: 28,
          padding: '12px 28px',
          borderRadius: 999,
          background: 'transparent',
          border: `1px solid ${color}`,
          color,
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Mark milestone complete
      </button>
      <span style={{ color: shell.textFaint, fontSize: 13, marginLeft: 14 }}>Auto-saves after the last video</span>
    </AppShell>
  );
}

/* ---------- Right docker ---------- */

function Docker({
  tab,
  setTab,
  color,
  resources,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  color: string;
  resources: Resource[];
}) {
  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['worksheet', 'notes', 'advisor'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              textTransform: 'capitalize',
              background: tab === t ? shell.panelRaised : 'transparent',
              color: tab === t ? shell.text : shell.textFaint,
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'worksheet' && <Worksheet color={color} resources={resources} />}
      {tab === 'notes' && (
        <textarea
          placeholder="Personal thoughts for this milestone…"
          style={{
            width: '100%',
            minHeight: 220,
            background: shell.panel,
            border: `1px solid ${shell.border}`,
            borderRadius: 12,
            padding: 14,
            color: shell.text,
            fontSize: 14,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      )}
      {tab === 'advisor' && (
        <p style={{ color: shell.textDim, fontSize: 14, lineHeight: 1.6 }}>
          Q&amp;A with Niki&apos;s knowledge base. Connects to the agent layer in Phase 2.
        </p>
      )}
    </div>
  );
}

function Worksheet({ color, resources }: { color: string; resources: Resource[] }) {
  const [chosen, setChosen] = useState<'yes' | 'no' | 'looking' | null>(null);
  const [checks, setChecks] = useState<boolean[]>([true, true, false, false]);

  return (
    <div>
      <h4 style={{ margin: 0, fontSize: 16, color: shell.text }}>Milestone worksheet</h4>
      <p style={{ ...eyebrow, marginTop: 4 }}>Fill as you watch · auto-saves</p>

      <p style={{ color: shell.text, fontSize: 14, marginTop: 20, marginBottom: 8 }}>Have you started this?</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['yes', 'no', 'looking'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setChosen(opt)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: `1px solid ${chosen === opt ? color : shell.border}`,
              background: chosen === opt ? color : 'transparent',
              color: chosen === opt ? domainColors.legal.onColor : shell.textDim,
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <Field label="Notes / who you contacted" placeholder="e.g. Maria Chen, Esq." />
      <Field label="Reference" placeholder="e.g. Chen & Associates" />

      {/* Checklist */}
      <p style={{ color: shell.text, fontSize: 14, marginTop: 22, marginBottom: 10 }}>Checklist</p>
      {['Reviewed the material', 'Completed the action', 'Saved a copy', 'Shared with my people'].map((c, i) => (
        <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
          <span
            onClick={() => setChecks((cs) => cs.map((v, j) => (j === i ? !v : v)))}
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              border: `2px solid ${checks[i] ? color : shell.textFaint}`,
              background: checks[i] ? color : 'transparent',
              color: domainColors.legal.onColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {checks[i] ? '✓' : ''}
          </span>
          <span style={{ color: shell.textDim, fontSize: 14 }}>{c}</span>
        </label>
      ))}

      {/* Resources from real content */}
      {resources.length > 0 && (
        <>
          <p style={{ ...eyebrow, marginTop: 22, marginBottom: 10 }}>Resources</p>
          {resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 8,
                background: shell.panel,
                border: `1px solid ${shell.border}`,
                color: shell.textDim,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              {r.label} ↗
            </a>
          ))}
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
        <button
          type="button"
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            background: 'transparent',
            border: `1px solid ${shell.border}`,
            color: shell.text,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Download PDF
        </button>
        <span style={{ color: shell.textFaint, fontSize: 12 }}>Saved 12s ago</span>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: shell.textDim, fontSize: 13, marginBottom: 6 }}>{label}</p>
      <input
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          background: shell.panel,
          border: `1px solid ${shell.border}`,
          color: shell.text,
          fontSize: 14,
        }}
      />
    </div>
  );
}

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: shell.textFaint,
  margin: 0,
};
