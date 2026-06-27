'use client';

/** Shared right-docker widgets for L1/L2: Peace of Mind score + advisor stub. */

import { domainColors, shell } from './domainColors';

export function PeaceOfMind({ score }: { score: number }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={eyebrow}>Peace of mind</p>
      <div
        style={{
          marginTop: 12,
          background: shell.panel,
          border: `1px solid ${shell.border}`,
          borderRadius: 14,
          padding: '24px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, color: shell.text }}>{score}</div>
        <div style={{ ...eyebrow, marginTop: 6 }}>of 100</div>
        <div style={{ marginTop: 16, height: 6, borderRadius: 3, background: '#1e293b' }}>
          <div style={{ width: `${score}%`, height: '100%', borderRadius: 3, background: domainColors.legal.base }} />
        </div>
      </div>
    </div>
  );
}

export function AdvisorStub() {
  return (
    <div>
      <p style={eyebrow}>Trusted advisor</p>
      <div
        style={{
          marginTop: 12,
          background: shell.panel,
          border: `1px solid ${shell.border}`,
          borderRadius: 14,
          padding: 20,
        }}
      >
        <h4 style={{ margin: 0, fontSize: 16, color: shell.text }}>Ask anything</h4>
        <p style={{ margin: '8px 0 16px', fontSize: 13, color: shell.textDim, lineHeight: 1.5 }}>
          When you&apos;re stuck or not sure what&apos;s next.
        </p>
        <button
          type="button"
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '10px 14px',
            borderRadius: 10,
            background: '#0b1120',
            border: `1px solid ${shell.border}`,
            color: shell.textFaint,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Ask a question…
        </button>
      </div>
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
