'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/common/Toast';

type Category = 'access' | 'billing' | 'content' | 'bug' | 'feature' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

const CATEGORY_LABEL: Record<Category, string> = {
  access: 'Access / Login',
  billing: 'Billing / Subscription',
  content: 'Learning Content',
  bug: 'Bug / Incident',
  feature: 'Feature Request',
  other: 'Other',
};

interface SubmitResult {
  ok: boolean;
  ticketId: string;
  mockEmailTo: string;
  queuedAt: string;
}

export default function SupportTicketForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState<Category>('bug');
  const [priority, setPriority] = useState<Priority>('medium');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const displayRole = useMemo(() => {
    if (!user) return 'Unknown';
    if (user.role === 'super_admin') return 'Super Admin';
    if (user.role === 'org_admin') return 'Org Admin';
    return 'Member';
  }, [user]);

  const submitTicket = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    if (!subject.trim() || !details.trim()) {
      toast('Please add both a subject and problem details.', 'warn');
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: user.role,
          organizationId: user.organizationId ?? null,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          category,
          priority,
          subject: subject.trim(),
          details: details.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }

      const data = (await response.json()) as SubmitResult;
      setResult(data);
      setSubject('');
      setDetails('');
      setPriority('medium');
      setCategory('bug');
      toast(`Ticket ${data.ticketId} submitted (mock email queued).`, 'success');
    } catch {
      toast('Unable to submit ticket. Please try again.', 'warn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
      <form
        onSubmit={submitTicket}
        className="rounded-[14px] p-6"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
          Raise A Problem Ticket
        </p>
        <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-5">
          Tell us what happened
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <label className="text-xs font-(family-name:--font-jura) tracking-[0.16em] uppercase text-(--lr-gold-soft)">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="mt-2 w-full rounded-[10px] px-3 py-2.5 text-sm bg-transparent border"
              style={{ borderColor: 'var(--border-gold)', color: 'var(--lr-pearl)' }}
            >
              {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value} style={{ color: '#10152A' }}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-(family-name:--font-jura) tracking-[0.16em] uppercase text-(--lr-gold-soft)">
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="mt-2 w-full rounded-[10px] px-3 py-2.5 text-sm bg-transparent border"
              style={{ borderColor: 'var(--border-gold)', color: 'var(--lr-pearl)' }}
            >
              <option value="low" style={{ color: '#10152A' }}>Low</option>
              <option value="medium" style={{ color: '#10152A' }}>Medium</option>
              <option value="high" style={{ color: '#10152A' }}>High</option>
              <option value="urgent" style={{ color: '#10152A' }}>Urgent</option>
            </select>
          </label>
        </div>

        <label className="block text-xs font-(family-name:--font-jura) tracking-[0.16em] uppercase text-(--lr-gold-soft) mb-4">
          Subject
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Example: Module progress not saving"
            className="mt-2 w-full rounded-[10px] px-3 py-2.5 text-sm bg-transparent border"
            style={{ borderColor: 'var(--border-gold)', color: 'var(--lr-pearl)' }}
            maxLength={120}
            required
          />
        </label>

        <label className="block text-xs font-(family-name:--font-jura) tracking-[0.16em] uppercase text-(--lr-gold-soft)">
          Problem Details
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={7}
            placeholder="What were you trying to do? What happened instead?"
            className="mt-2 w-full rounded-[10px] px-3 py-2.5 text-sm bg-transparent border resize-y"
            style={{ borderColor: 'var(--border-gold)', color: 'var(--lr-pearl)' }}
            maxLength={2000}
            required
          />
        </label>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[0.7rem] text-(--lr-lavender-dust)">
            Mock mode: this submits a ticket and simulates sending email to support.
          </p>
          <button type="submit" disabled={submitting} className="lr-btn-primary min-w-[190px]">
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </div>
      </form>

      <aside
        className="rounded-[14px] p-6"
        style={{
          background: 'linear-gradient(180deg, rgba(212,190,148,0.16) 0%, rgba(212,190,148,0.05) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
          Request Context
        </p>
        <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.06em] mb-4">
          Ticket Preview
        </h3>

        <div className="space-y-2 text-sm">
          <p className="text-(--lr-pearl)"><span className="text-(--lr-gold-soft)">From:</span> {user?.firstName} {user?.lastName}</p>
          <p className="text-(--lr-pearl)"><span className="text-(--lr-gold-soft)">Email:</span> {user?.email}</p>
          <p className="text-(--lr-pearl)"><span className="text-(--lr-gold-soft)">Role:</span> {displayRole}</p>
          <p className="text-(--lr-pearl)"><span className="text-(--lr-gold-soft)">Category:</span> {CATEGORY_LABEL[category]}</p>
          <p className="text-(--lr-pearl)"><span className="text-(--lr-gold-soft)">Priority:</span> {priority}</p>
        </div>

        {result ? (
          <div
            className="mt-5 rounded-[10px] px-4 py-3"
            style={{ background: 'rgba(92,138,111,0.12)', border: '1px solid #5C8A6F' }}
          >
            <p className="font-(family-name:--font-jura) text-[0.62rem] tracking-[0.2em] uppercase text-[#5C8A6F] mb-1">
              Mock Email Queued
            </p>
            <p className="text-sm text-(--lr-pearl)">Ticket {result.ticketId}</p>
            <p className="text-xs text-(--lr-lavender-dust) mt-1">Recipient: {result.mockEmailTo}</p>
            <p className="text-xs text-(--lr-lavender-dust)">Queued at: {new Date(result.queuedAt).toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-xs text-(--lr-lavender-dust) mt-5 leading-relaxed">
            After submit, we generate a mock ticket ID and simulate a support email delivery.
          </p>
        )}
      </aside>
    </div>
  );
}
