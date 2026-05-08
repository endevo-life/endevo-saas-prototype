import { NextResponse } from 'next/server';

interface TicketRequestBody {
  userId: string;
  role: 'super_admin' | 'org_admin' | 'org_member';
  organizationId: string | null;
  name: string;
  email: string;
  category: string;
  priority: string;
  subject: string;
  details: string;
}

const MOCK_SUPPORT_EMAIL = 'support@endevo.life';

function makeTicketId(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LR-${y}${m}${d}-${rand}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<TicketRequestBody>;

  if (!body.subject || !body.details || !body.email || !body.name || !body.role) {
    return NextResponse.json(
      { ok: false, error: 'Missing required ticket fields.' },
      { status: 400 }
    );
  }

  const ticketId = makeTicketId();
  const queuedAt = new Date().toISOString();

  // Mock email dispatch. Replace with real provider integration later.
  console.info('[mock-support-email]', {
    ticketId,
    to: MOCK_SUPPORT_EMAIL,
    queuedAt,
    from: { name: body.name, email: body.email },
    role: body.role,
    organizationId: body.organizationId ?? null,
    category: body.category ?? 'other',
    priority: body.priority ?? 'medium',
    subject: body.subject,
    details: body.details,
  });

  return NextResponse.json({
    ok: true,
    ticketId,
    mockEmailTo: MOCK_SUPPORT_EMAIL,
    queuedAt,
  });
}
