// Mock notifications for the bell dropdown — per persona.
// Mirrors the audit-log shape but framed for the recipient instead of
// the auditor (one is "what just happened to you", the other is
// "what just happened on the platform").

export type NotificationCategory =
  | 'milestone'   // streak, badge, level-up, domain complete
  | 'unlock'      // new lesson, new letter, new chapter
  | 'reminder'    // gentle nudge, missed day, idle member
  | 'social'      // welcome, admin sent reminder, cohort circle
  | 'cohort'      // org-admin notifications about their workforce
  | 'tenant'      // super-admin notifications about platform tenants
  | 'security'    // failed sign-in, account locked, suspicious activity
  | 'system';     // SOC 2 bundle, billing, retention

export type NotificationSeverity = 'info' | 'success' | 'warn' | 'critical';

export interface AppNotification {
  id: string;
  userId: string;
  timestamp: string;            // ISO 8601
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  actionLabel?: string;
  actionRoute?: string;
  read: boolean;
}

export const SEVERITY_DOT: Record<NotificationSeverity, string> = {
  info:     'var(--lr-steel)',
  success:  'var(--lr-gold)',
  warn:     'var(--lr-gold-soft)',
  critical: '#A65454',
};

/**
 * Persona-specific notifications. Timestamps anchor near 2026-04-30
 * so relative-time labels read naturally in the demo.
 */
export const allNotifications: AppNotification[] = [
  /* ─────────── Sarah Mitchell — emp-1, advanced member 78% ─────────── */
  {
    id: 'n-sm-1',
    userId: 'emp-1',
    timestamp: '2026-04-30T08:42:00Z',
    category: 'milestone',
    severity: 'success',
    title: 'Streak Shield armed',
    body: 'You can miss one day this week without breaking your 11-day streak.',
    read: false,
  },
  {
    id: 'n-sm-2',
    userId: 'emp-1',
    timestamp: '2026-04-30T05:18:00Z',
    category: 'unlock',
    severity: 'info',
    title: 'A letter to your executor unlocked',
    body: 'You completed the Legal domain. Your first sealed letter is now in the Letter Vault.',
    actionLabel: 'Open the vault',
    actionRoute: '/org/member/path',
    read: false,
  },
  {
    id: 'n-sm-3',
    userId: 'emp-1',
    timestamp: '2026-04-29T14:12:00Z',
    category: 'social',
    severity: 'info',
    title: 'Jennifer sent a quiet reminder',
    body: 'Your Org Admin nudged the cohort. Nothing about your answers shared — just a note.',
    read: true,
  },
  {
    id: 'n-sm-4',
    userId: 'emp-1',
    timestamp: '2026-04-28T16:00:00Z',
    category: 'milestone',
    severity: 'success',
    title: 'You earned the Custodian badge',
    body: 'Reached Level 3 on the path. Three of four domains held with care.',
    read: true,
  },
  {
    id: 'n-sm-5',
    userId: 'emp-1',
    timestamp: '2026-04-27T10:31:00Z',
    category: 'unlock',
    severity: 'info',
    title: 'Final Playbook chapter compiled · Legal',
    body: 'Your first chapter is ready. The Playbook adds a chapter for each domain you finish.',
    actionLabel: 'View Final Playbook',
    actionRoute: '/org/member/certificates',
    read: true,
  },

  /* ─────────── Marcus Reed — emp-2, in progress 35% ─────────── */
  {
    id: 'n-mr-1',
    userId: 'emp-2',
    timestamp: '2026-04-30T08:55:00Z',
    category: 'milestone',
    severity: 'success',
    title: 'Day 4 of your streak',
    body: 'Three more days earns the Week One badge. Today\'s threshold takes about 8 minutes.',
    actionLabel: 'Continue today',
    actionRoute: '/org/member/dashboard',
    read: false,
  },
  {
    id: 'n-mr-2',
    userId: 'emp-2',
    timestamp: '2026-04-29T18:20:00Z',
    category: 'reminder',
    severity: 'info',
    title: 'Financial domain · 3 lessons remaining',
    body: 'Beneficiary review takes 8 minutes — the next-best lesson on your weakest scenario.',
    actionLabel: 'Resume Financial',
    actionRoute: '/org/member/modules/financial',
    read: false,
  },
  {
    id: 'n-mr-3',
    userId: 'emp-2',
    timestamp: '2026-04-28T09:00:00Z',
    category: 'social',
    severity: 'info',
    title: 'Welcome from Jennifer',
    body: 'Your Org Admin welcomed you to the cohort.',
    read: true,
  },

  /* ─────────── Aisha Patel — emp-4, day one 0% ─────────── */
  {
    id: 'n-ap-1',
    userId: 'emp-4',
    timestamp: '2026-04-30T09:05:00Z',
    category: 'social',
    severity: 'info',
    title: 'Welcome to Endevo, Aisha',
    body: 'Your Legacy Path is ready. Take a few minutes to begin your assessment.',
    actionLabel: 'Begin assessment',
    actionRoute: '/org/member/assessment',
    read: false,
  },
  {
    id: 'n-ap-2',
    userId: 'emp-4',
    timestamp: '2026-04-30T09:05:00Z',
    category: 'reminder',
    severity: 'info',
    title: 'Your starting line awaits',
    body: 'Choose any of the four domains to begin — Legal, Financial, Digital, or Physical.',
    actionLabel: 'Pick a domain',
    actionRoute: '/org/member/assessment',
    read: false,
  },
  {
    id: 'n-ap-3',
    userId: 'emp-4',
    timestamp: '2026-04-29T15:00:00Z',
    category: 'social',
    severity: 'info',
    title: 'Jennifer added you to XYZ Company',
    body: 'You\'re now part of the Legacy Readiness cohort at XYZ Company.',
    read: true,
  },

  /* ─────────── Jennifer Chen — org-admin-1 ─────────── */
  {
    id: 'n-jc-1',
    userId: 'org-admin-1',
    timestamp: '2026-04-30T07:30:00Z',
    category: 'cohort',
    severity: 'success',
    title: 'Sarah Mitchell completed the Legal domain',
    body: 'A new Final Playbook chapter compiled for her. (You see only completion — never her answers.)',
    read: false,
  },
  {
    id: 'n-jc-2',
    userId: 'org-admin-1',
    timestamp: '2026-04-30T05:00:00Z',
    category: 'cohort',
    severity: 'info',
    title: 'New member: Aisha Patel',
    body: 'Onboarded this morning. Yet to start her assessment.',
    actionLabel: 'View roster',
    actionRoute: '/org/admin/employees',
    read: false,
  },
  {
    id: 'n-jc-3',
    userId: 'org-admin-1',
    timestamp: '2026-04-29T09:00:00Z',
    category: 'cohort',
    severity: 'info',
    title: 'Weekly cohort digest is ready',
    body: 'Readiness up 12% this week. Caregiver Solutions leads at 78% avg.',
    actionLabel: 'Open analytics',
    actionRoute: '/org/admin/analytics',
    read: true,
  },
  {
    id: 'n-jc-4',
    userId: 'org-admin-1',
    timestamp: '2026-04-28T14:30:00Z',
    category: 'reminder',
    severity: 'warn',
    title: 'Marcus hasn\'t signed in for 3 days',
    body: 'A quiet nudge from you tends to bring members back without pressure.',
    actionLabel: 'Send reminder',
    actionRoute: '/org/admin/dashboard',
    read: true,
  },

  /* ─────────── Lisa Johnson — org-admin-2, Innovate Labs ─────────── */
  {
    id: 'n-lj-1',
    userId: 'org-admin-2',
    timestamp: '2026-04-30T07:50:00Z',
    category: 'cohort',
    severity: 'info',
    title: '3 new members onboarded this week',
    body: 'Innovate Labs is now at 28 active members across the platform.',
    read: false,
  },
  {
    id: 'n-lj-2',
    userId: 'org-admin-2',
    timestamp: '2026-04-30T05:14:00Z',
    category: 'security',
    severity: 'warn',
    title: 'Failed sign-in alert',
    body: 'Three failed attempts on lisa.johnson@innovate.com. We held the lockout — looks like a typo.',
    read: false,
  },
  {
    id: 'n-lj-3',
    userId: 'org-admin-2',
    timestamp: '2026-04-28T09:15:00Z',
    category: 'system',
    severity: 'info',
    title: 'April invoice issued',
    body: '$1,880 · Professional tier · 28 seats. Payment due in 30 days.',
    read: true,
  },

  /* ─────────── Nermeen Khan — admin-1, super admin ─────────── */
  {
    id: 'n-nk-1',
    userId: 'admin-1',
    timestamp: '2026-04-30T07:14:00Z',
    category: 'security',
    severity: 'critical',
    title: 'Account locked after 8 failed sign-ins',
    body: 'unknown@xyzcompany.com from 45.155.205.233 — 30-minute lockout active. Worth a look.',
    actionLabel: 'Open audit logs',
    actionRoute: '/superadmin/audit-logs',
    read: false,
  },
  {
    id: 'n-nk-2',
    userId: 'admin-1',
    timestamp: '2026-04-29T08:45:00Z',
    category: 'tenant',
    severity: 'warn',
    title: 'Northstar Finance: invoice 31 days overdue',
    body: 'Tenant suspended automatically. AR has been notified.',
    actionLabel: 'View tenant',
    actionRoute: '/superadmin/organizations',
    read: false,
  },
  {
    id: 'n-nk-3',
    userId: 'admin-1',
    timestamp: '2026-04-28T16:33:00Z',
    category: 'tenant',
    severity: 'success',
    title: 'XYZ Company upgraded to Enterprise',
    body: 'Seat limit raised to 25,000. New brand-kit access enabled.',
    read: false,
  },
  {
    id: 'n-nk-4',
    userId: 'admin-1',
    timestamp: '2026-04-27T11:47:00Z',
    category: 'system',
    severity: 'info',
    title: 'Module 04 · Healthcare Directives v1.3 published',
    body: 'Propagated to all three active tenants. No content review flags.',
    read: true,
  },
  {
    id: 'n-nk-5',
    userId: 'admin-1',
    timestamp: '2026-04-25T08:00:00Z',
    category: 'system',
    severity: 'info',
    title: 'SOC 2 quarterly bundle generated',
    body: '142 MB · signed by platform-key-2026. Stored for 7-year retention.',
    actionLabel: 'View in audit logs',
    actionRoute: '/superadmin/audit-logs',
    read: true,
  },
];

export function getNotificationsForUser(userId: string): AppNotification[] {
  return allNotifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function unreadCount(userId: string): number {
  return allNotifications.filter((n) => n.userId === userId && !n.read).length;
}
