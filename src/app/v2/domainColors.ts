/**
 * v2 brand palette — single source of truth.
 *
 * Per UX_REDESIGN.md §4: amber / teal / coral / cyan / slate replaces the
 * prototype's gold/navy Eternal Geometry scheme. This file is ONLY consumed
 * by the /v2 surface; the live prototype is untouched.
 *
 * All five base hexes exceed 4.5:1 contrast against navy #0f172a.
 */

export type DomainKey =
  | 'legal'
  | 'financial'
  | 'physical'
  | 'digital'
  | 'communication';

export interface DomainToken {
  base: string;
  tint: string;
  border: string;
  onColor: string;
}

export const domainColors: Record<DomainKey, DomainToken> = {
  legal: { base: '#f59e0b', tint: '#f59e0b14', border: '#f59e0b40', onColor: '#0f172a' },
  financial: { base: '#14b8a6', tint: '#14b8a614', border: '#14b8a640', onColor: '#0f172a' },
  physical: { base: '#fb7185', tint: '#fb718514', border: '#fb718540', onColor: '#0f172a' },
  digital: { base: '#22d3ee', tint: '#22d3ee14', border: '#22d3ee40', onColor: '#0f172a' },
  communication: { base: '#94a3b8', tint: '#94a3b814', border: '#94a3b840', onColor: '#0f172a' },
};

/** Shell surface tokens — navy stays (it's locked, on-brand). */
export const shell = {
  bg: '#0b1120',
  panel: '#0f172a',
  panelRaised: '#16203a',
  border: '#1e293b',
  borderSoft: '#1e293b80',
  text: '#e2e8f0',
  textDim: '#94a3b8',
  textFaint: '#64748b',
};

/**
 * Navigation accent — one consistent turquoise/green used across all nav
 * chrome (logo, left-rail active state). Per Theresa's review: keeping the
 * nav teal stops it competing with the amber call-to-action buttons in the
 * center pane, which are the actions we actually want the eye to land on.
 */
export const nav = {
  base: '#14b8a6',
  tint: '#14b8a614',
  border: '#14b8a640',
  onColor: '#0f172a',
};
