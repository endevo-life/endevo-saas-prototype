// Mock audit log data — Endevo (SaaS provider) view
// What the platform team and compliance auditors look at.
//
// In production, these events are emitted by the API gateway, auth service,
// admin actions, and background jobs. The frontend reads a paginated feed
// (typically from CloudWatch / OpenSearch / a dedicated audit table).

export type AuditCategory =
  | 'tenant'         // tenant lifecycle (create, suspend, tier change)
  | 'identity'       // user/role changes, invitations
  | 'auth'           // login, logout, failed attempts, password resets
  | 'privacy'        // cohort views, exports, AI queries (privacy-sensitive)
  | 'config'         // module publishing, settings changes
  | 'system';        // background jobs, retention, billing, integrations

export type AuditSeverity = 'info' | 'warn' | 'critical';

export type AuditActorType = 'super_admin' | 'org_admin' | 'org_member' | 'system';

export interface AuditEvent {
  id: string;
  timestamp: string;          // ISO 8601
  category: AuditCategory;
  severity: AuditSeverity;
  actor: {
    type: AuditActorType;
    name: string;             // 'System' for system actor
    email?: string;
  };
  action: string;             // human-readable verb phrase
  target?: string;            // what was acted on (org name, user, module, etc.)
  tenant?: string;            // tenant slug or name (omit for cross-platform events)
  ip?: string;                // request IP (omit for system actor)
  metadata?: Record<string, string | number>;
}

export const CATEGORY_META: Record<AuditCategory, { label: string; blurb: string }> = {
  tenant:   { label: 'Tenant',   blurb: 'Org lifecycle — created, suspended, tier changed' },
  identity: { label: 'Identity', blurb: 'Users invited, roles changed, accounts removed' },
  auth:     { label: 'Auth',     blurb: 'Sign-ins, sign-outs, failed attempts, MFA' },
  privacy:  { label: 'Privacy',  blurb: 'Cohort views, exports, AI queries — privacy-sensitive' },
  config:   { label: 'Config',   blurb: 'Modules published, settings, billing config' },
  system:   { label: 'System',   blurb: 'Background jobs, retention, integrations' },
};

export const SEVERITY_META: Record<AuditSeverity, { label: string; color: string; tint: string }> = {
  info:     { label: 'Info',     color: 'var(--lr-steel)',     tint: 'rgba(72,88,128,0.12)' },
  warn:     { label: 'Warn',     color: 'var(--lr-gold-soft)', tint: 'rgba(195,172,128,0.16)' },
  critical: { label: 'Critical', color: '#A65454',             tint: 'rgba(166,84,84,0.16)' },
};

/**
 * Seed events spanning ~7 days. Mix of every category so the demo
 * shows the full picture an enterprise auditor would expect to see.
 */
export const auditEvents: AuditEvent[] = [
  // ── Today (2026-04-30) ──────────────────────────────────────
  {
    id: 'evt-001',
    timestamp: '2026-04-30T09:14:32Z',
    category: 'auth',
    severity: 'warn',
    actor: { type: 'system', name: 'Auth Gateway' },
    action: 'Failed login attempt — invalid password',
    target: 'lisa.johnson@innovate.com',
    tenant: 'Innovate Labs',
    ip: '198.51.100.42',
    metadata: { attemptCount: 3 },
  },
  {
    id: 'evt-002',
    timestamp: '2026-04-30T08:42:11Z',
    category: 'privacy',
    severity: 'info',
    actor: { type: 'org_admin', name: 'Jennifer Chen', email: 'jennifer.chen@xyzcompany.com' },
    action: 'Exported cohort readiness report',
    target: 'cohort_readiness_2026-04-30.csv',
    tenant: 'XYZ Company',
    ip: '203.0.113.12',
    metadata: { format: 'csv', rows: 4 },
  },
  {
    id: 'evt-003',
    timestamp: '2026-04-30T08:31:05Z',
    category: 'auth',
    severity: 'info',
    actor: { type: 'org_admin', name: 'Jennifer Chen', email: 'jennifer.chen@xyzcompany.com' },
    action: 'Signed in',
    tenant: 'XYZ Company',
    ip: '203.0.113.12',
  },
  {
    id: 'evt-004',
    timestamp: '2026-04-30T07:55:47Z',
    category: 'system',
    severity: 'info',
    actor: { type: 'system', name: 'Retention Worker' },
    action: 'Daily data retention sweep completed',
    metadata: { recordsReviewed: 18420, recordsRedacted: 0 },
  },

  // ── Yesterday (2026-04-29) ──────────────────────────────────
  {
    id: 'evt-005',
    timestamp: '2026-04-29T17:22:18Z',
    category: 'privacy',
    severity: 'info',
    actor: { type: 'org_admin', name: 'Jennifer Chen', email: 'jennifer.chen@xyzcompany.com' },
    action: 'Ran AI analytics query',
    target: '"compare Caregiver Solutions vs Chronic Disease readiness"',
    tenant: 'XYZ Company',
    ip: '203.0.113.12',
  },
  {
    id: 'evt-006',
    timestamp: '2026-04-29T14:08:33Z',
    category: 'identity',
    severity: 'info',
    actor: { type: 'org_admin', name: 'Jennifer Chen', email: 'jennifer.chen@xyzcompany.com' },
    action: 'Sent member invitation',
    target: 'aisha.patel@xyzcompany.com',
    tenant: 'XYZ Company',
    ip: '203.0.113.12',
  },
  {
    id: 'evt-007',
    timestamp: '2026-04-29T11:47:09Z',
    category: 'config',
    severity: 'info',
    actor: { type: 'super_admin', name: 'Nermeen Khan', email: 'nermeen@endevo.life' },
    action: 'Published lesson revision',
    target: 'Module 04 · Healthcare Directives — v1.3',
    ip: '198.51.100.5',
    metadata: { affectedTenants: 3 },
  },
  {
    id: 'evt-008',
    timestamp: '2026-04-29T10:12:54Z',
    category: 'auth',
    severity: 'critical',
    actor: { type: 'system', name: 'Auth Gateway' },
    action: 'Account locked after repeated failed sign-in',
    target: 'unknown@xyzcompany.com',
    tenant: 'XYZ Company',
    ip: '45.155.205.233',
    metadata: { attemptCount: 8, lockoutMinutes: 30 },
  },

  // ── 2 days ago (2026-04-28) ─────────────────────────────────
  {
    id: 'evt-009',
    timestamp: '2026-04-28T16:33:21Z',
    category: 'tenant',
    severity: 'info',
    actor: { type: 'super_admin', name: 'Nermeen Khan', email: 'nermeen@endevo.life' },
    action: 'Upgraded subscription tier',
    target: 'XYZ Company → Enterprise',
    tenant: 'XYZ Company',
    ip: '198.51.100.5',
    metadata: { previousTier: 'professional', seatLimit: 25000 },
  },
  {
    id: 'evt-010',
    timestamp: '2026-04-28T15:10:02Z',
    category: 'identity',
    severity: 'info',
    actor: { type: 'super_admin', name: 'Nermeen Khan', email: 'nermeen@endevo.life' },
    action: 'Granted Org Admin role',
    target: 'jennifer.chen@xyzcompany.com',
    tenant: 'XYZ Company',
    ip: '198.51.100.5',
  },
  {
    id: 'evt-011',
    timestamp: '2026-04-28T13:28:44Z',
    category: 'privacy',
    severity: 'warn',
    actor: { type: 'org_admin', name: 'Lisa Johnson', email: 'lisa.johnson@innovate.com' },
    action: 'Bulk-exported member roster (third export this week)',
    target: 'innovate_members_2026-04-28.csv',
    tenant: 'Innovate Labs',
    ip: '198.51.100.78',
    metadata: { format: 'csv', rows: 28 },
  },
  {
    id: 'evt-012',
    timestamp: '2026-04-28T09:15:11Z',
    category: 'system',
    severity: 'info',
    actor: { type: 'system', name: 'Billing' },
    action: 'Monthly invoice issued',
    target: 'Innovate Labs · April 2026',
    tenant: 'Innovate Labs',
    metadata: { amountUsd: 1880, status: 'sent' },
  },

  // ── 3 days ago (2026-04-27) ─────────────────────────────────
  {
    id: 'evt-013',
    timestamp: '2026-04-27T20:04:38Z',
    category: 'auth',
    severity: 'warn',
    actor: { type: 'system', name: 'Auth Gateway' },
    action: 'Sign-in from new device',
    target: 'sarah.mitchell@xyzcompany.com',
    tenant: 'XYZ Company',
    ip: '203.0.113.88',
    metadata: { device: 'iPhone · Safari' },
  },
  {
    id: 'evt-014',
    timestamp: '2026-04-27T15:55:27Z',
    category: 'config',
    severity: 'info',
    actor: { type: 'org_admin', name: 'Jennifer Chen', email: 'jennifer.chen@xyzcompany.com' },
    action: 'Updated tenant brand colors',
    tenant: 'XYZ Company',
    ip: '203.0.113.12',
  },
  {
    id: 'evt-015',
    timestamp: '2026-04-27T11:22:07Z',
    category: 'privacy',
    severity: 'info',
    actor: { type: 'super_admin', name: 'Nermeen Khan', email: 'nermeen@endevo.life' },
    action: 'Viewed cross-tenant analytics',
    ip: '198.51.100.5',
    metadata: { tenants: 3 },
  },

  // ── 4-5 days ago ────────────────────────────────────────────
  {
    id: 'evt-016',
    timestamp: '2026-04-26T14:48:19Z',
    category: 'tenant',
    severity: 'info',
    actor: { type: 'super_admin', name: 'Nermeen Khan', email: 'nermeen@endevo.life' },
    action: 'Provisioned new tenant',
    target: 'Northstar Finance',
    tenant: 'Northstar Finance',
    ip: '198.51.100.5',
    metadata: { tier: 'enterprise', seatLimit: 250 },
  },
  {
    id: 'evt-017',
    timestamp: '2026-04-26T10:11:55Z',
    category: 'identity',
    severity: 'info',
    actor: { type: 'system', name: 'Onboarding Worker' },
    action: 'Member account activated after first sign-in',
    target: 'aisha.patel@xyzcompany.com',
    tenant: 'XYZ Company',
  },
  {
    id: 'evt-018',
    timestamp: '2026-04-25T19:33:08Z',
    category: 'auth',
    severity: 'info',
    actor: { type: 'org_member', name: 'Marcus Reed', email: 'marcus.reed@xyzcompany.com' },
    action: 'Password reset completed',
    tenant: 'XYZ Company',
    ip: '203.0.113.142',
  },
  {
    id: 'evt-019',
    timestamp: '2026-04-25T08:00:00Z',
    category: 'system',
    severity: 'info',
    actor: { type: 'system', name: 'SOC2 Export' },
    action: 'Quarterly compliance bundle generated',
    target: 'soc2_q1_2026.zip',
    metadata: { sizeMb: 142, signedBy: 'platform-key-2026' },
  },

  // ── 6+ days ago ─────────────────────────────────────────────
  {
    id: 'evt-020',
    timestamp: '2026-04-24T16:42:31Z',
    category: 'config',
    severity: 'warn',
    actor: { type: 'super_admin', name: 'Nermeen Khan', email: 'nermeen@endevo.life' },
    action: 'Disabled module — content review pending',
    target: 'Module 06 · Communicating Your Wishes',
    ip: '198.51.100.5',
    metadata: { affectedTenants: 3 },
  },
  {
    id: 'evt-021',
    timestamp: '2026-04-24T13:17:44Z',
    category: 'tenant',
    severity: 'critical',
    actor: { type: 'super_admin', name: 'Nermeen Khan', email: 'nermeen@endevo.life' },
    action: 'Suspended tenant — payment dispute',
    target: 'Northstar Finance',
    tenant: 'Northstar Finance',
    ip: '198.51.100.5',
    metadata: { reason: 'invoice 2026-03 unpaid 31 days' },
  },
  {
    id: 'evt-022',
    timestamp: '2026-04-23T17:08:53Z',
    category: 'privacy',
    severity: 'info',
    actor: { type: 'org_member', name: 'Sarah Mitchell', email: 'sarah.mitchell@xyzcompany.com' },
    action: 'Exported personal FinalPlaybook',
    tenant: 'XYZ Company',
    ip: '203.0.113.88',
    metadata: { sections: 3 },
  },
  {
    id: 'evt-023',
    timestamp: '2026-04-23T09:04:17Z',
    category: 'identity',
    severity: 'warn',
    actor: { type: 'org_admin', name: 'Lisa Johnson', email: 'lisa.johnson@innovate.com' },
    action: 'Removed member',
    target: 'former.employee@innovate.com',
    tenant: 'Innovate Labs',
    ip: '198.51.100.78',
    metadata: { dataRetention: '90 days' },
  },
];

/* Helpers */

export function getEventsByCategory(category: AuditCategory | 'all'): AuditEvent[] {
  if (category === 'all') return auditEvents;
  return auditEvents.filter((e) => e.category === category);
}

export function getEventsBySeverity(severity: AuditSeverity | 'all'): AuditEvent[] {
  if (severity === 'all') return auditEvents;
  return auditEvents.filter((e) => e.severity === severity);
}

export function getRecentEvents(hours: number): AuditEvent[] {
  // Anchor "now" to the most recent event timestamp so the demo
  // remains coherent regardless of when the page is loaded.
  const sorted = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (sorted.length === 0) return [];
  const newest = new Date(sorted[0].timestamp).getTime();
  const cutoff = newest - hours * 60 * 60 * 1000;
  return sorted.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
}
