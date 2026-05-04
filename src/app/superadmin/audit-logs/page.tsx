'use client';

import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/common/Toast';
import {
  AuditCategory,
  AuditEvent,
  AuditSeverity,
  CATEGORY_META,
  SEVERITY_META,
  auditEvents,
} from '@/lib/audit-data';

type CategoryFilter = AuditCategory | 'all';
type SeverityFilter = AuditSeverity | 'all';
type TimeRange = '24h' | '7d' | '30d' | 'all';

const TIME_RANGE_HOURS: Record<TimeRange, number | null> = {
  '24h': 24,
  '7d':  24 * 7,
  '30d': 24 * 30,
  'all': null,
};

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [range, setRange] = useState<TimeRange>('7d');
  const [search, setSearch] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filtered = useMemo(() => {
    const sorted = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (sorted.length === 0) return [];

    // Anchor "now" to the newest event so the time-range filter
    // works coherently in the seeded demo data.
    const newest = new Date(sorted[0].timestamp).getTime();
    const hours = TIME_RANGE_HOURS[range];
    const cutoff = hours === null ? -Infinity : newest - hours * 60 * 60 * 1000;
    const q = search.trim().toLowerCase();

    return sorted.filter((e) => {
      if (category !== 'all' && e.category !== category) return false;
      if (severity !== 'all' && e.severity !== severity) return false;
      if (new Date(e.timestamp).getTime() < cutoff) return false;
      if (q) {
        const blob = `${e.action} ${e.target ?? ''} ${e.actor.name} ${e.actor.email ?? ''} ${e.tenant ?? ''} ${e.ip ?? ''}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [category, severity, range, search]);

  const stats = useMemo(() => {
    const hours = TIME_RANGE_HOURS[range];
    const sorted = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const newest = sorted.length > 0 ? new Date(sorted[0].timestamp).getTime() : Date.now();
    const cutoff = hours === null ? -Infinity : newest - hours * 60 * 60 * 1000;

    const inRange = auditEvents.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
    const actors = new Set(inRange.map((e) => e.actor.email ?? e.actor.name));
    const critical = inRange.filter((e) => e.severity === 'critical').length;
    const warns = inRange.filter((e) => e.severity === 'warn').length;

    return { total: inRange.length, actors: actors.size, critical, warns };
  }, [range]);

  const handleExport = (format: 'csv' | 'json') => {
    setShowExportMenu(false);
    const today = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const header = ['Timestamp', 'Category', 'Severity', 'Actor', 'Email', 'Action', 'Target', 'Tenant', 'IP'];
      const rows = filtered.map((e) => [
        e.timestamp,
        e.category,
        e.severity,
        e.actor.name,
        e.actor.email ?? '',
        e.action,
        e.target ?? '',
        e.tenant ?? '',
        e.ip ?? '',
      ]);
      const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      downloadBlob(csv, `audit_log_${today}.csv`, 'text/csv');
    } else {
      downloadBlob(JSON.stringify(filtered, null, 2), `audit_log_${today}.json`, 'application/json');
    }
    toast(`Exported ${filtered.length} event${filtered.length === 1 ? '' : 's'}`, 'success');
  };

  return (
    <DashboardLayout title="Audit logs" role="super_admin">
      {/* Header strip */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Platform activity
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-3xl tracking-[0.06em] mt-1">
            Every action, every actor
          </h2>
          <p className="text-xs text-(--lr-lavender-dust) mt-1.5">
            Tenant-scoped events · auth · privacy-sensitive operations · system jobs
          </p>
        </div>

        <div className="relative">
          <button onClick={() => setShowExportMenu((o) => !o)} className="lr-btn-primary">
            Export ▾
          </button>
          {showExportMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-[10px] overflow-hidden z-30"
              style={{
                background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                border: '1px solid var(--border-gold)',
                boxShadow: '0 18px 40px -16px rgba(0,0,0,0.55)',
              }}
            >
              <ExportOption label="As spreadsheet (.csv)" hint={`${filtered.length} rows`} onClick={() => handleExport('csv')} />
              <ExportOption label="As JSON" hint="For SIEM ingestion" onClick={() => handleExport('json')} />
              <ExportOption
                label="Schedule weekly digest"
                hint="Email Mondays 09:00"
                onClick={() => {
                  toast('Weekly digest scheduled — first delivery Monday', 'success');
                  setShowExportMenu(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Compliance banner */}
      <div
        className="rounded-[14px] mb-6 px-5 py-4 flex items-start gap-3"
        style={{ background: 'rgba(212,190,148,0.08)', border: '1px solid var(--border-gold)' }}
      >
        <span className="text-(--lr-gold) text-lg leading-none mt-0.5">◆</span>
        <p className="text-sm text-(--lr-pearl) leading-relaxed opacity-90">
          <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-[0.7rem] text-(--lr-gold) block mb-1">
            SOC 2 · HIPAA-aware
          </span>
          Audit events are append-only, signed, and retained for 7 years. Member content (lesson notes,
          reflections, FinalPlaybook contents) is never logged here — only the action taken on it.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <Stat label="Events" value={String(stats.total)} sub={`in ${rangeLabel(range)}`} accent />
        <Stat label="Unique actors" value={String(stats.actors)} sub="people + system services" />
        <Stat label="Warnings" value={String(stats.warns)} sub="review when convenient" />
        <Stat label="Critical" value={String(stats.critical)} sub="needs attention" />
      </div>

      {/* Filter row */}
      <div
        className="rounded-[14px] p-5 mb-5"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="grid lg:grid-cols-[1fr_auto_auto_auto] gap-4 items-end">
          <FilterField label="Search">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="actor, action, tenant, IP…"
              className="w-full rounded-[10px] px-4 py-2.5 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold) transition-colors"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
            />
          </FilterField>

          <FilterField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryFilter)}
              className="w-full rounded-[10px] px-4 py-2.5 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold) transition-colors"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
            >
              <option value="all" style={{ background: 'var(--lr-navy-deep)' }}>All</option>
              {(Object.keys(CATEGORY_META) as AuditCategory[]).map((c) => (
                <option key={c} value={c} style={{ background: 'var(--lr-navy-deep)' }}>
                  {CATEGORY_META[c].label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Severity">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as SeverityFilter)}
              className="w-full rounded-[10px] px-4 py-2.5 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold) transition-colors"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
            >
              <option value="all" style={{ background: 'var(--lr-navy-deep)' }}>All</option>
              {(Object.keys(SEVERITY_META) as AuditSeverity[]).map((s) => (
                <option key={s} value={s} style={{ background: 'var(--lr-navy-deep)' }}>
                  {SEVERITY_META[s].label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Window">
            <div className="flex gap-1 flex-wrap">
              {(['24h', '7d', '30d', 'all'] as TimeRange[]).map((r) => {
                const active = range === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.18em] uppercase px-3 py-2 rounded-[8px] transition-all"
                    style={{
                      background: active ? 'var(--lr-gold)' : 'rgba(212,190,148,0.06)',
                      color: active ? 'var(--lr-navy-deep)' : 'var(--lr-pearl)',
                      border: active ? '1px solid var(--lr-gold)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </FilterField>
        </div>
      </div>

      {/* Event feed */}
      <div
        className="rounded-[14px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="px-6 py-4 flex items-baseline justify-between border-b border-(--border-subtle)">
          <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-lg tracking-[0.05em]">
            {filtered.length} event{filtered.length === 1 ? '' : 's'}
          </p>
          <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-lavender-dust)">
            Newest first
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-(--lr-pearl) opacity-80">No events match these filters.</p>
            <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust) mt-2">
              Widen the time window or clear filters
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* ──────────── components ──────────── */

function EventRow({ event }: { event: AuditEvent }) {
  const sev = SEVERITY_META[event.severity];
  const cat = CATEGORY_META[event.category];

  return (
    <div
      className="px-6 py-4 grid lg:grid-cols-[160px_120px_1fr_180px] gap-4 items-start"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      {/* Timestamp */}
      <div>
        <p className="font-(family-name:--font-jetbrains) text-(--lr-pearl) text-xs">
          {formatTimestamp(event.timestamp)}
        </p>
        <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust) mt-1">
          {relativeTime(event.timestamp)}
        </p>
      </div>

      {/* Severity + category pills */}
      <div className="flex flex-col gap-1.5">
        <span
          className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.22em] uppercase px-2 py-0.5 rounded-full inline-block w-fit"
          style={{ color: sev.color, background: sev.tint, border: `1px solid ${sev.color}` }}
          title={sev.label}
        >
          {sev.label}
        </span>
        <span className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.22em] uppercase text-(--lr-gold-soft)">
          {cat.label}
        </span>
      </div>

      {/* Action + target + actor */}
      <div className="min-w-0">
        <p className="text-sm text-(--lr-pearl) leading-snug">
          <span className="font-(family-name:--font-italiana) text-(--lr-gold) tracking-[0.04em]">
            {event.actor.name}
          </span>
          <span className="opacity-60 mx-1.5">·</span>
          {event.action}
          {event.target && (
            <>
              <span className="opacity-60 mx-1.5">→</span>
              <span className="font-(family-name:--font-jetbrains) text-(--lr-pearl)">{event.target}</span>
            </>
          )}
        </p>
        {(event.actor.email || event.metadata) && (
          <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.16em] uppercase text-(--lr-lavender-dust) mt-1">
            {event.actor.email ?? `Actor type: ${event.actor.type}`}
            {event.metadata &&
              Object.entries(event.metadata).map(([k, v]) => (
                <span key={k} className="ml-3">
                  {k}: <span className="text-(--lr-gold-soft)">{String(v)}</span>
                </span>
              ))}
          </p>
        )}
      </div>

      {/* Tenant + IP */}
      <div className="text-right">
        {event.tenant ? (
          <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.18em] uppercase text-(--lr-gold)">
            {event.tenant}
          </p>
        ) : (
          <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust) opacity-60">
            Cross-platform
          </p>
        )}
        {event.ip && (
          <p className="font-(family-name:--font-jetbrains) text-[0.6rem] text-(--lr-lavender-dust) mt-1">
            {event.ip}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div
      className="rounded-[14px] p-5"
      style={{
        background: accent
          ? 'linear-gradient(180deg, rgba(212,190,148,0.16) 0%, rgba(212,190,148,0.06) 100%)'
          : 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
        border: accent ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
      }}
    >
      <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </p>
      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-3xl">{value}</p>
      <p className="text-xs text-(--lr-lavender-dust) mt-1.5">{sub}</p>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase block mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function ExportOption({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <p className="text-sm text-(--lr-pearl)">{label}</p>
      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
        {hint}
      </p>
    </button>
  );
}

/* ──────────── helpers ──────────── */

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function relativeTime(iso: string): string {
  // Anchor "now" to the most recent seeded event so the demo
  // shows coherent relative times no matter when it's loaded.
  const sorted = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const now = sorted.length > 0 ? new Date(sorted[0].timestamp).getTime() : Date.now();
  const t = new Date(iso).getTime();
  const mins = Math.round((now - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function rangeLabel(r: TimeRange): string {
  return r === '24h' ? 'last 24h' : r === '7d' ? 'last 7 days' : r === '30d' ? 'last 30 days' : 'all time';
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
