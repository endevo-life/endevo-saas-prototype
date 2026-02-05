/**
 * ENDevo Brand Colors - Theme System
 * ===================================
 * 
 * This file contains the complete ENDevo color palette and theming system.
 * Colors can be customized per organization while maintaining brand consistency.
 * 
 * Usage:
 * ------
 * 1. Import in your CSS/SCSS files
 * 2. Apply data-org attribute to body tag for organization theming
 * 3. Use CSS variables in your components
 * 
 * Example:
 * --------
 * <body data-org="techcorp" data-role="hr_admin">
 *   ...
 * </body>
 * 
 * const Button = () => (
 *   <button style={{ backgroundColor: 'var(--brand-accent)' }}>
 *     Click Me
 *   </button>
 * );
 */

/* ============================================
   ENDevo Core Brand Colors
   ============================================ */

export const ENDevoColors = {
  // Primary Colors
  deepSpace: '#08123A',
  settingSun: '#FF5D00',

  // Secondary Colors
  openSeas: '#58BBB6',
  guidingLight: '#C9FB3F',
  pureWhite: '#FFFFFF',
  compassionateGrey: '#D5D1C7',

  // Setting Sun Variations
  settingSunTint2: '#FFBE99',
  settingSunTint1: '#FF7D33',
  settingSunShade1: '#401700',
  settingSunShade2: '#802F00',

  // Deep Space Variations
  deepSpaceTint4: '#CED0D8',
  deepSpaceTint3: '#9CA0B0',
  deepSpaceTint2: '#6B7189',
  deepSpaceTint1: '#394161',
};

/* ============================================
   Tailwind CSS Configuration Extension
   ============================================ */

export const tailwindColors = {
  endevo: {
    'deep-space': {
      DEFAULT: '#08123A',
      'tint-1': '#394161',
      'tint-2': '#6B7189',
      'tint-3': '#9CA0B0',
      'tint-4': '#CED0D8',
    },
    'setting-sun': {
      DEFAULT: '#FF5D00',
      'tint-1': '#FF7D33',
      'tint-2': '#FFBE99',
      'shade-1': '#401700',
      'shade-2': '#802F00',
    },
    'open-seas': '#58BBB6',
    'guiding-light': '#C9FB3F',
    'compassionate-grey': '#D5D1C7',
  },
};

/* ============================================
   Organization Theme Presets
   ============================================ */

export const organizationThemes = {
  endevo: {
    primary: ENDevoColors.deepSpace,
    accent: ENDevoColors.settingSun,
    secondary: ENDevoColors.openSeas,
    tertiary: ENDevoColors.guidingLight,
    neutral: ENDevoColors.compassionateGrey,
  },
  techcorp: {
    primary: '#1E40AF',
    accent: '#F97316',
    secondary: '#10B981',
    tertiary: '#8B5CF6',
    neutral: '#D1D5DB',
  },
  innovate: {
    primary: '#7C3AED',
    accent: '#EC4899',
    secondary: '#06B6D4',
    tertiary: '#F59E0B',
    neutral: '#E5E7EB',
  },
  globalfinance: {
    primary: '#1F2937',
    accent: '#DC2626',
    secondary: '#059669',
    tertiary: '#FBBF24',
    neutral: '#D1D5DB',
  },
};

/* ============================================
   Helper Functions
   ============================================ */

/**
 * Apply organization theme to document
 * @param {string} orgSlug - Organization slug (e.g., 'techcorp')
 */
export function applyOrgTheme(orgSlug: string) {
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-org', orgSlug);
  }
}

/**
 * Apply role-specific styling
 * @param {string} role - User role (super_admin, hr_admin, employee)
 */
export function applyRoleTheme(role: string) {
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-role', role);
  }
}

/**
 * Get theme colors for an organization
 * @param {string} orgSlug - Organization slug
 * @returns {object} Theme color object
 */
export function getOrgTheme(orgSlug: string) {
  return organizationThemes[orgSlug as keyof typeof organizationThemes] || organizationThemes.endevo;
}

/**
 * Generate CSS custom properties string for an organization
 * @param {string} orgSlug - Organization slug
 * @returns {string} CSS custom properties
 */
export function generateThemeCSS(orgSlug: string) {
  const theme = getOrgTheme(orgSlug);
  return `
    --brand-primary: ${theme.primary};
    --brand-accent: ${theme.accent};
    --brand-secondary: ${theme.secondary};
    --brand-tertiary: ${theme.tertiary};
    --brand-grey: ${theme.neutral};
  `;
}

export default ENDevoColors;
