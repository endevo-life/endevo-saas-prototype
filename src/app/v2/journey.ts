/**
 * v2 journey model.
 *
 * Adapts the existing src/lib/module-content.ts DOMAINS into the redesign's
 * five-domain / milestone structure (UX_REDESIGN.md §3). Each lesson in a
 * domain becomes a "milestone" card. This is a read-only view over current
 * content — no new content source, no backend change.
 */

import { DOMAINS, type Lesson } from '@/lib/module-content';
import type { DomainKey } from './domainColors';

export type MilestoneStatus = 'complete' | 'current' | 'available' | 'locked';

export interface Milestone {
  id: string;
  label: string; // e.g. "L1"
  title: string;
  type: Lesson['type'];
  duration: string;
  videoCount: number;
  worksheetCount: number;
  status: MilestoneStatus;
  lesson: Lesson;
}

export interface Domain {
  key: DomainKey;
  label: string;
  blurb: string;
  milestones: Milestone[];
  completeCount: number;
  totalCount: number;
}

const DOMAIN_ORDER: { key: DomainKey; source: string; label: string; blurb: string }[] = [
  { key: 'legal', source: 'legal', label: 'Legal', blurb: 'Will, executor, healthcare proxy — the documents that protect those you love.' },
  { key: 'financial', source: 'financial', label: 'Financial', blurb: 'Accounts, beneficiaries, obligations — the financial map your people will need.' },
  { key: 'physical', source: 'physical', label: 'Physical', blurb: 'Belongings, ceremony, the physical space of your life. Dignity in the details.' },
  { key: 'digital', source: 'digital', label: 'Digital', blurb: 'Logins, devices, online identity — the self that lives only online.' },
  { key: 'communication', source: 'build', label: 'Communication', blurb: 'The conversations that matter — and how to start them now.' },
];

/**
 * Per-domain completion fractions, derived from a member's overall progress.
 * Earlier domains fill first (the journey is roughly sequential), so a member
 * at 78% has Legal mostly done and later domains barely started.
 */
function domainFraction(progress: number, index: number): number {
  // Spread the 0–100 progress across 5 domains with a soft front-load.
  const per = 100 / DOMAIN_ORDER.length;
  const start = index * per;
  const local = (progress - start) / per;
  return Math.max(0, Math.min(1, local));
}

export function buildJourney(progress: number): Domain[] {
  return DOMAIN_ORDER.map((d, index) => {
    const content = DOMAINS[d.source];
    const lessons = content?.lessons ?? [];
    const frac = domainFraction(progress, index);
    const completeCount = Math.round(frac * lessons.length);

    const milestones: Milestone[] = lessons.map((lesson, i): Milestone => {
      let status: MilestoneStatus;
      if (i < completeCount) status = 'complete';
      else if (i === completeCount) status = frac > 0 ? 'current' : 'available';
      else if (i === completeCount + 1) status = 'available';
      else status = 'locked';

      const videoCount = lesson.driveId ? 1 : 0;
      const worksheetCount =
        lesson.resources?.filter((r) => r.kind === 'typeform' || r.kind === 'pdf' || r.kind === 'quiz').length ?? 0;

      return {
        id: lesson.id,
        label: `L${i + 1}`,
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
        videoCount,
        worksheetCount: Math.max(worksheetCount, 1),
        status,
        lesson,
      };
    });

    return {
      key: d.key,
      label: d.label,
      blurb: d.blurb,
      milestones,
      completeCount,
      totalCount: lessons.length,
    };
  });
}

export function findDomain(journey: Domain[], key: string): Domain | undefined {
  return journey.find((d) => d.key === key);
}

export function findMilestone(domain: Domain, milestoneId: string): Milestone | undefined {
  return domain.milestones.find((m) => m.id === milestoneId);
}

/** The member's resume point — first non-complete milestone across the journey. */
export function resumePoint(journey: Domain[]): { domain: Domain; milestone: Milestone } | null {
  for (const domain of journey) {
    const m = domain.milestones.find((x) => x.status === 'current' || x.status === 'available');
    if (m) return { domain, milestone: m };
  }
  return null;
}
