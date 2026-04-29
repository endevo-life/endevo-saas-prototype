'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockOrganizations } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const totalOrgs = mockOrganizations.length;
  const activeOrgs = mockOrganizations.filter((o) => o.status === 'active').length;
  const totalEmployees = mockOrganizations.reduce((sum, org) => sum + org.employeeCount, 0);
  const avgEngagement = 68;

  return (
    <DashboardLayout title="Platform Overview" role="super_admin">
      {/* Stats — score-style cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Stat label="Tenants" value={String(totalOrgs)}      sub="organizations" accent />
        <Stat label="Active"  value={String(activeOrgs)}     sub={`of ${totalOrgs} live`} />
        <Stat label="Members" value={String(totalEmployees)} sub="across all tenants" />
        <Stat label="Avg engagement" value={`${avgEngagement}%`} sub="last 30 days" />
      </div>

      {/* Org table */}
      <div
        className="rounded-[14px] overflow-hidden mb-8"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-baseline justify-between px-6 py-5 border-b border-(--border-subtle)">
          <div>
            <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
              Tenants
            </p>
            <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mt-1">
              All organizations
            </h2>
          </div>
          <button onClick={() => router.push('/admin/organizations')} className="lr-btn-primary">
            Manage tenants →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(212,190,148,0.04)' }}>
                <Th>Organization</Th>
                <Th>Status</Th>
                <Th>Tier</Th>
                <Th>Members</Th>
                <Th>Created</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {mockOrganizations.map((org) => (
                <tr
                  key={org.id}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-(family-name:--font-jura) text-xs tracking-wider"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-midnight) 100%)',
                          color: 'var(--lr-gold)',
                          border: '1px solid var(--lr-gold)',
                        }}
                      >
                        {org.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-(--lr-pearl)">{org.name}</p>
                        <p className="text-[0.65rem] tracking-[0.18em] uppercase font-(family-name:--font-jura) text-(--lr-gold-soft)">
                          {org.slug}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <StatusPill status={org.status} />
                  </Td>
                  <Td>
                    <span className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.16em] uppercase text-(--lr-pearl)">
                      {org.subscriptionTier}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-sm">
                      {org.employeeCount}
                    </span>
                    <span className="font-(family-name:--font-jetbrains) text-(--lr-lavender-dust) text-xs ml-1">
                      / {org.employeeLimit}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-(family-name:--font-jetbrains) text-xs text-(--lr-lavender-dust)">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </span>
                  </Td>
                  <Td align="right">
                    <button
                      onClick={() => router.push(`/admin/organizations`)}
                      className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-gold) hover:text-(--lr-gold-pale) mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => toast(`Edit ${org.name} — full form on tenant detail`)}
                      className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-pearl) hover:text-(--lr-gold)"
                    >
                      Edit
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-5">
        <ActionCard
          eyebrow="Onboarding"
          title="Add a new tenant"
          body="Provision a new employer organization with admin invites and default modules."
          onClick={() => router.push('/admin/organizations')}
          cta="Open organizations"
        />
        <ActionCard
          eyebrow="Identity"
          title="Manage platform users"
          body="View HR admins and members across every tenant. Filter, search, audit access."
          onClick={() => router.push('/admin/users')}
          cta="Open users"
        />
        <ActionCard
          eyebrow="Insight"
          title="Cross-tenant analytics"
          body="Compare engagement, completions and band distribution across all customers."
          onClick={() => router.push('/admin/analytics')}
          cta="Open analytics"
        />
      </div>
    </DashboardLayout>
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

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-6 py-3 ${align === 'right' ? 'text-right' : 'text-left'} font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase`}
      style={{ color: 'var(--lr-gold-soft)' }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <td className={`px-6 py-4 ${align === 'right' ? 'text-right' : ''} whitespace-nowrap`}>{children}</td>;
}

function StatusPill({ status }: { status: 'active' | 'trial' | 'suspended' }) {
  const styles =
    status === 'active'
      ? { color: 'var(--lr-gold)', border: 'var(--lr-gold)', bg: 'rgba(212,190,148,0.12)' }
      : status === 'trial'
      ? { color: 'var(--lr-gold-pale)', border: 'var(--lr-gold-pale)', bg: 'rgba(228,215,185,0.12)' }
      : { color: '#A65454', border: '#A65454', bg: 'rgba(166,84,84,0.16)' };
  return (
    <span
      className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
      style={{ color: styles.color, border: `1px solid ${styles.border}`, background: styles.bg }}
    >
      {status}
    </span>
  );
}

function ActionCard({ eyebrow, title, body, cta, onClick }: { eyebrow: string; title: string; body: string; cta: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-[14px] p-6 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
        {eyebrow}
      </p>
      <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mb-2">
        {title}
      </p>
      <p className="text-sm text-(--lr-pearl) opacity-85 leading-relaxed mb-5">{body}</p>
      <span className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.22em] uppercase text-(--lr-gold)">
        {cta} →
      </span>
    </button>
  );
}
