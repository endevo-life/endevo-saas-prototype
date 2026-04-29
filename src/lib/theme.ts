/**
 * Legacy Readiness OS — Eternal Geometry
 * =======================================
 *
 * Brand tokens for the platform. The runtime UI reads these as CSS
 * custom properties (see globals.css). This file is the JS-side mirror
 * for places that need the values inline (e.g. recharts colors).
 */

export const LRColors = {
  // Primary blues
  midnight: '#12162A',
  navyDeep: '#1C2644',
  navyMid:  '#2A3A62',
  steel:    '#485880',

  // Champagne golds
  gold:     '#D4BE94',
  goldSoft: '#C3AC80',
  goldPale: '#E4D7B9',

  // Neutrals
  charcoal:     '#232026',
  warmSlate:    '#5F5A64',
  lavenderDust: '#B4AFC3',
  pearl:        '#EBE8E1',
  ivory:        '#FCFAF5',
};

/**
 * Palette ordered for chart series. Keeps charts on-brand by drawing
 * Champagne Gold first, Steel Blue second, etc. — never the old orange.
 */
export const chartPalette = [
  LRColors.gold,        // primary series
  LRColors.steel,       // secondary series
  LRColors.goldSoft,    // tertiary
  LRColors.navyMid,     // quaternary
  LRColors.lavenderDust,
  LRColors.goldPale,
];

/**
 * Status colors that still need to read as success / warning / error
 * but stay tonally close to the brand (no neon greens or fire-engine reds).
 */
export const statusColors = {
  success: '#5C8A6F',
  warning: LRColors.goldSoft,
  error:   '#A65454',
  info:    LRColors.steel,
};

/**
 * Four life domains — every screen orders them this way.
 * 01 LEGAL · 02 FINANCIAL · 03 DIGITAL · 04 PHYSICAL
 */
export const LIFE_DOMAINS = [
  { id: 'legal',     number: '01', label: 'LEGAL'     },
  { id: 'financial', number: '02', label: 'FINANCIAL' },
  { id: 'digital',   number: '03', label: 'DIGITAL'   },
  { id: 'physical',  number: '04', label: 'PHYSICAL'  },
] as const;

export type LifeDomainId = (typeof LIFE_DOMAINS)[number]['id'];

/* ============================================
   Helpers (kept for AuthContext compatibility)
   ============================================ */

export function applyOrgTheme(orgSlug: string) {
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-org', orgSlug);
  }
}

export function applyRoleTheme(role: string) {
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-role', role);
  }
}

export default LRColors;
