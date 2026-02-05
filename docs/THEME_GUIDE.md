# ENDevo Brand Colors & Theme System

## 📋 Overview

This document explains how to use the ENDevo brand color system and apply custom themes per organization.

## 🎨 ENDevo Brand Colors

### Primary Colors
- **Deep Space** `#08123A` - Primary brand color, represents trust and professionalism
- **Setting Sun** `#FF5D00` - Accent color, represents warmth and action

### Secondary Colors
- **Open Seas** `#58BBB6` - Represents calm and clarity
- **Guiding Light** `#C9FB3F` - Represents hope and growth
- **Pure White** `#FFFFFF` - Clean backgrounds
- **Compassionate Grey** `#D5D1C7` - Neutral elements

### Color Variations

#### Setting Sun Variations
- **Tint 2** `#FFBE99` - Light accent
- **Tint 1** `#FF7D33` - Medium accent
- **Shade 1** `#401700` - Dark accent
- **Shade 2** `#802F00` - Darker accent

#### Deep Space Variations
- **Tint 4** `#CED0D8` - Very light
- **Tint 3** `#9CA0B0` - Light
- **Tint 2** `#6B7189` - Medium
- **Tint 1** `#394161` - Dark

## 🔧 Usage

### 1. CSS Variables (Recommended)

Use CSS variables in your components for maximum flexibility:

```tsx
// Inline styles
<div style={{ backgroundColor: 'var(--brand-primary)' }}>
  Content
</div>

// CSS/SCSS files
.button {
  background-color: var(--brand-accent);
  color: var(--brand-white);
}

.button:hover {
  background-color: var(--brand-accent-light);
}
```

### 2. Utility Classes

Use pre-defined utility classes:

```tsx
<div className="bg-brand-primary text-brand-white">
  Primary branded content
</div>

<button className="bg-brand-accent border-brand-accent">
  Accent button
</button>
```

### 3. TypeScript/JavaScript

Import colors directly in your code:

```tsx
import { ENDevoColors } from '@/lib/theme';

const MyComponent = () => (
  <div style={{ backgroundColor: ENDevoColors.deepSpace }}>
    Content
  </div>
);
```

## 🏢 Organization Theming

### Applying Organization Theme

The theme is automatically applied when a user logs in based on their organization:

```tsx
// Automatic (handled by AuthContext)
// When user logs in, their org theme is applied

// Manual
import { applyOrgTheme } from '@/lib/theme';
applyOrgTheme('techcorp');
```

### Predefined Organization Themes

#### TechCorp
```css
--brand-primary: #1E40AF (Blue)
--brand-accent: #F97316 (Orange)
--brand-secondary: #10B981 (Green)
```

#### Innovate Labs
```css
--brand-primary: #7C3AED (Purple)
--brand-accent: #EC4899 (Pink)
--brand-secondary: #06B6D4 (Cyan)
```

#### Global Finance
```css
--brand-primary: #1F2937 (Dark Gray)
--brand-accent: #DC2626 (Red)
--brand-secondary: #059669 (Green)
```

### Creating Custom Organization Theme

1. **Edit `src/lib/theme.ts`**:

```tsx
export const organizationThemes = {
  // ... existing themes
  myorg: {
    primary: '#YOUR_PRIMARY_COLOR',
    accent: '#YOUR_ACCENT_COLOR',
    secondary: '#YOUR_SECONDARY_COLOR',
    tertiary: '#YOUR_TERTIARY_COLOR',
    neutral: '#YOUR_NEUTRAL_COLOR',
  },
};
```

2. **Apply in HTML**:

```html
<body data-org="myorg">
  <!-- Your app -->
</body>
```

3. **Or use JavaScript**:

```tsx
applyOrgTheme('myorg');
```

## 🎭 Role-Based Theming

Different user roles can have different styling:

```tsx
import { applyRoleTheme } from '@/lib/theme';

// Apply role theme
applyRoleTheme('super_admin');
applyRoleTheme('hr_admin');
applyRoleTheme('employee');
```

### Role-Specific CSS

```css
/* Super Admin gets ENDevo branding */
body[data-role="super_admin"] {
  --brand-primary: var(--endevo-deep-space);
  --brand-accent: var(--endevo-setting-sun);
}

/* HR & Employees get org branding */
body[data-role="hr_admin"][data-org="techcorp"] {
  --brand-primary: #1E40AF;
}
```

## 📚 Available CSS Variables

### Brand Colors
```css
--brand-primary           /* Main brand color */
--brand-primary-light     /* Lighter variant */
--brand-primary-lighter   /* Even lighter */
--brand-primary-lightest  /* Lightest variant */

--brand-accent           /* Accent/action color */
--brand-accent-light     /* Lighter accent */
--brand-accent-lighter   /* Even lighter accent */
--brand-accent-dark      /* Darker accent */
--brand-accent-darker    /* Darkest accent */

--brand-secondary        /* Secondary brand color */
--brand-tertiary         /* Tertiary brand color */
--brand-grey            /* Neutral gray */
--brand-white           /* Pure white */
```

### ENDevo Specific Colors
```css
--endevo-deep-space
--endevo-deep-space-tint-1
--endevo-deep-space-tint-2
--endevo-deep-space-tint-3
--endevo-deep-space-tint-4

--endevo-setting-sun
--endevo-setting-sun-tint-1
--endevo-setting-sun-tint-2
--endevo-setting-sun-shade-1
--endevo-setting-sun-shade-2

--endevo-open-seas
--endevo-guiding-light
--endevo-pure-white
--endevo-compassionate-grey
```

### UI Component Colors
```css
--background              /* Page background */
--background-secondary    /* Secondary bg */
--background-dark        /* Dark bg */

--foreground             /* Text color */
--text-primary          /* Primary text */
--text-secondary        /* Secondary text */
--text-muted           /* Muted text */

--button-primary        /* Primary button */
--button-primary-hover  /* Primary hover */
--button-accent        /* Accent button */
--button-accent-hover  /* Accent hover */
```

### Status Colors
```css
--color-success         /* Success green */
--color-success-light   /* Light success */
--color-warning         /* Warning amber */
--color-warning-light   /* Light warning */
--color-error          /* Error red */
--color-error-light    /* Light error */
--color-info           /* Info blue */
--color-info-light     /* Light info */
```

## 🎨 Design Guidelines

### When to Use Each Color

**Deep Space (Primary)**
- Navigation bars
- Headers
- Primary buttons
- Important text
- Logos

**Setting Sun (Accent)**
- Call-to-action buttons
- Links
- Interactive elements
- Progress indicators
- Highlights

**Open Seas (Secondary)**
- Supporting elements
- Success states
- Calm sections
- Info messages

**Guiding Light (Tertiary)**
- Highlights
- Special callouts
- Positive reinforcement
- Achievement badges

**Compassionate Grey (Neutral)**
- Backgrounds
- Borders
- Disabled states
- Subtle elements

## 💡 Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Test with multiple organization themes** to ensure consistency
3. **Maintain contrast ratios** for accessibility (WCAG AA minimum)
4. **Use semantic variable names** (`--button-primary` not `--color-blue`)
5. **Document custom themes** in your organization's style guide

## 🔄 Migration Guide

### From Old Colors to New System

```tsx
// ❌ Old (hardcoded)
<div className="bg-blue-600">

// ✅ New (theme variables)
<div style={{ backgroundColor: 'var(--brand-primary)' }}>

// ❌ Old (Tailwind utilities)
<button className="bg-blue-500 hover:bg-blue-600">

// ✅ New (CSS variables)
<button style={{ 
  backgroundColor: 'var(--brand-accent)',
}} 
onMouseEnter={(e) => {
  e.currentTarget.style.backgroundColor = 'var(--brand-accent-light)';
}}>
```

## 🧪 Testing Themes

### Switch Organization Theme
```tsx
import { applyOrgTheme } from '@/lib/theme';

// Test different org themes
applyOrgTheme('endevo');
applyOrgTheme('techcorp');
applyOrgTheme('innovate');
```

### Preview All Themes
See `src/app/page.tsx` for the login page which showcases all brand colors.

## 📞 Support

For questions about the theme system:
1. Check this documentation
2. Review `src/lib/theme.ts`
3. Review `src/app/globals.css`
4. Refer to ENDevo MVP Specification in `/docs`

---

**ENDevo Theme System v1.0**  
Last updated: February 4, 2026
