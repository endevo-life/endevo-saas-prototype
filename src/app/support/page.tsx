'use client';

import DashboardLayout from '@/components/DashboardLayout';
import SupportTicketForm from '@/components/support/SupportTicketForm';
import { useAuth } from '@/contexts/AuthContext';

export default function SupportPage() {
  const { user } = useAuth();

  if (!user) return null;

  const title =
    user.role === 'super_admin'
      ? 'Platform Support'
      : user.role === 'org_admin'
      ? 'Organization Support'
      : 'Member Support';

  return (
    <DashboardLayout title={title} role={user.role}>
      <div className="mb-6">
        <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
          Help Center
        </p>
        <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em]">
          Raise a ticket and contact support
        </h2>
        <p className="text-sm text-(--lr-lavender-dust) mt-2">
          This is a mock workflow for now. A real email provider can be connected later.
        </p>
      </div>

      <SupportTicketForm />
    </DashboardLayout>
  );
}
