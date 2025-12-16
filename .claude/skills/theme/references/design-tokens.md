# Design Tokens Reference

## Overview

This document contains all design tokens (CSS custom properties) for the TS Type Debugger design system. These tokens enable consistent theming and easy maintenance across the entire application.

---

## Color Tokens

### Dracula Dark Theme

```css
:root {
  /* Background Colors */
  --bg: #282a36;
  --bg-secondary: #21222c;
  --bg-highlight: #44475a;
  --bg-editor: #282a36;
  --bg-active: #44475a;
  --bg-hover: #44475a;
  --current-line: #44475a;
  --selection: #44475a;

  /* Text Colors */
  --foreground: #f8f8f2;
  --text-primary: #f8f8f2;
  --text-secondary: #6272a4;
  --text-tertiary: #6272a4;
  --text-disabled: #44475a;
  --comment: #6272a4;

  /* Border Colors */
  --border: #44475a;
  --border-subtle: #44475a;
  --border-medium: #6272a4;

  /* Accent Colors */
  --cyan: #8be9fd;
  --green: #50fa7b;
  --orange: #ffb86c;
  --pink: #ff79c6;
  --purple: #bd93f9;
  --red: #ff5555;
  --yellow: #f1fa8c;

  /* Semantic Accent Colors */
  --accent-primary: #50fa7b;
  --accent-primary-alt: #2ecc71;
  --accent-highlight: #8be9fd;
  --accent-warning: #ffb86c;
  --accent-success: #50fa7b;
  --accent-error: #ff5555;
  --btn-accent-text: #282a36;
}
```

### Dracula Light Theme

```css
body.theme-light {
  /* Background Colors */
  --bg: #f8f8f2;
  --bg-secondary: #f1f1f0;
  --bg-highlight: #e8e8e4;
  --bg-editor: #f8f8f2;
  --bg-active: #e8e8e4;
  --bg-hover: #e8e8e4;
  --current-line: #e8e8e4;
  --selection: #d6d6d0;

  /* Text Colors */
  --foreground: #282a36;
  --text-primary: #282a36;
  --text-secondary: #7c8db5;
  --text-tertiary: #7c8db5;
  --text-disabled: #d6d6d0;
  --comment: #7c8db5;

  /* Border Colors */
  --border: #d6d6d0;
  --border-subtle: #d6d6d0;
  --border-medium: #7c8db5;

  /* Accent Colors */
  --cyan: #0fb9d2;
  --green: #2ecc71;
  --orange: #e6a050;
  --pink: #e06ba8;
  --purple: #9b6dff;
  --red: #e04545;
  --yellow: #d4b830;

  /* Semantic Accent Colors */
  --accent-primary: #2ecc71;
  --accent-primary-alt: #27ae60;
  --accent-highlight: #0fb9d2;
  --accent-warning: #e6a050;
  --accent-success: #2ecc71;
  --accent-error: #e04545;
  --btn-accent-text: #282a36;
}
```

---

## Syntax Highlighting Tokens

```css
:root {
  --syntax-keyword: #ff79c6;
  --syntax-type: #8be9fd;
  --syntax-string: #f1fa8c;
  --syntax-number: #bd93f9;
  --syntax-comment: #6272a4;
  --syntax-punctuation: #f8f8f2;
}

body.theme-light {
  --syntax-keyword: #e06ba8;
  --syntax-type: #0fb9d2;
  --syntax-string: #2ecc71;
  --syntax-number: #9b6dff;
  --syntax-comment: #7c8db5;
  --syntax-punctuation: #282a36;
}
```

---

## Step Type Colors (Debug Visualizer)

```css
:root {
  --step-generic-call: #8be9fd;
  --step-generic-def: #bd93f9;
  --step-generic-result: #50fa7b;
  --step-condition: #ffb86c;
  --step-conditional-evaluate-left: #ff79c6;
  --step-conditional-evaluate-right: #ff79c6;
  --step-conditional-evaluation: #ffb86c;
  --step-branch-true: #50fa7b;
  --step-branch-false: #ff5555;
  --step-template-literal: #8be9fd;
  --step-alias-reference: #bd93f9;
  --step-substitution: #8be9fd;
  --step-mapped-type-start: #bd93f9;
  --step-mapped-type-constraint: #ffb86c;
  --step-mapped-type-constraint-result: #ffb86c;
  --step-map-iteration: #8be9fd;
  --step-mapped-type-result: #50fa7b;
  --step-mapped-type-end: #bd93f9;
  --step-indexed-access: #8be9fd;
  --step-indexed-access-result: #50fa7b;
  --step-type-alias-start: #6272a4;
}

body.theme-light {
  --step-generic-call: #0fb9d2;
  --step-generic-def: #9b6dff;
  --step-generic-result: #2ecc71;
  --step-condition: #e6a050;
  --step-conditional-evaluate-left: #e06ba8;
  --step-conditional-evaluate-right: #e06ba8;
  --step-conditional-evaluation: #e6a050;
  --step-branch-true: #2ecc71;
  --step-branch-false: #e04545;
  --step-template-literal: #0fb9d2;
  --step-alias-reference: #9b6dff;
  --step-substitution: #0fb9d2;
  --step-mapped-type-start: #9b6dff;
  --step-mapped-type-constraint: #e6a050;
  --step-mapped-type-constraint-result: #e6a050;
  --step-map-iteration: #0fb9d2;
  --step-mapped-type-result: #2ecc71;
  --step-mapped-type-end: #9b6dff;
  --step-indexed-access: #0fb9d2;
  --step-indexed-access-result: #2ecc71;
  --step-type-alias-start: #7c8db5;
}
```

---

## Color Usage Guidelines

### Background Hierarchy

| Token | Purpose | Use Cases |
|-------|---------|-----------|
| `--bg` | Primary background | Main application background, panel content areas |
| `--bg-secondary` | Secondary surfaces | Headers, toolbars, sidebars, card backgrounds |
| `--bg-highlight` | Interactive highlight | Hover states, selected items, focused areas |
| `--bg-editor` | Code editor background | Monaco editor, code blocks |
| `--bg-active` | Active state | Currently selected items |
| `--bg-hover` | Hover state | Elements on mouse hover |
| `--current-line` | Active line indicator | Current code line, active stack frame |
| `--selection` | Text selection | User text selection background |

### Text Hierarchy

| Token | Purpose | Contrast Ratio (Dark) | Use Cases |
|-------|---------|----------------------|-----------|
| `--foreground` | Primary text | 13.55:1 (AAA) | Body text, headings, primary content |
| `--text-primary` | Primary text (alias) | 13.55:1 (AAA) | Same as foreground |
| `--text-secondary` | Secondary text | 4.52:1 (AA) | Metadata, labels, line numbers |
| `--text-tertiary` | Tertiary text | 4.52:1 (AA) | Hints, placeholders |
| `--text-disabled` | Disabled text | - | Disabled states |
| `--comment` | Comment text | 4.52:1 (AA) | Code comments, secondary info |

### Border Hierarchy

| Token | Purpose | Use Cases |
|-------|---------|-----------|
| `--border` | Standard border | Panel borders, section dividers |
| `--border-subtle` | Subtle border | Light dividers, inner borders |
| `--border-medium` | Medium border | Emphasized borders, focus rings |

### Semantic Accent Colors

| Token | Purpose | Applied To |
|-------|---------|------------|
| `--accent-primary` | Primary action | Main buttons, active states |
| `--accent-primary-alt` | Primary alt | Hover state for primary |
| `--accent-highlight` | Highlight | Links, focus, selection highlight |
| `--accent-warning` | Warning | Warning states, caution indicators |
| `--accent-success` | Success | Success states, confirmations |
| `--accent-error` | Error | Error states, destructive actions |
| `--btn-accent-text` | Button text | Text color on accent backgrounds |

### Syntax Highlighting

| Token | Purpose | Applied To |
|-------|---------|------------|
| `--syntax-keyword` | Keywords | `type`, `const`, `let`, `function`, operators |
| `--syntax-type` | Types | Type names, interfaces, classes |
| `--syntax-string` | Strings | String literals |
| `--syntax-number` | Numbers | Numeric literals |
| `--syntax-comment` | Comments | Code comments |
| `--syntax-punctuation` | Punctuation | Brackets, semicolons, etc. |

### UI Elements

| Token | Purpose | Use Cases |
|-------|---------|-----------|
| `--border` | Dividers & borders | Panel borders, section dividers, button borders |
| `--shadow-*` (light only) | Elevation | Headers, cards, elevated elements |

---

## Spacing Tokens

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-xxl: 24px;
}
```

### Spacing Usage

| Token | Value | Use Cases |
|-------|-------|-----------|
| `--spacing-xs` | 4px | Tight gaps, icon spacing |
| `--spacing-sm` | 8px | Small gaps, button groups |
| `--spacing-md` | 12px | Header padding, section padding |
| `--spacing-lg` | 16px | Large padding (expression boxes) |
| `--spacing-xl` | 20px | Horizontal padding (most components) |
| `--spacing-xxl` | 24px | Header horizontal padding |

---

## Typography Tokens

### Font Families

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --font-mono: 'Fira Code', monospace;
}
```

### Font Sizes

```css
:root {
  --font-size-xs: 12px;   /* Badges, small labels */
  --font-size-sm: 13px;   /* Secondary text, toggles */
  --font-size-md: 14px;   /* Default body text */
  --font-size-lg: 15px;   /* Emphasized text */
  --font-size-xl: 16px;   /* Headings, logo */
  --font-size-2xl: 18px;  /* Large headings */
  --font-size-3xl: 24px;  /* Section titles */
  --font-size-4xl: 28px;  /* Page titles */
}
```

### Font Weights

```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Line Heights

```css
:root {
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
  --leading-loose: 1.7;  /* Used for code display */
}
```

---

## Border Radius Tokens

```css
:root {
  --radius-sm: 4px;   /* Small elements, scrollbar thumb */
  --radius-md: 6px;   /* Standard radius for buttons, inputs */
  --radius-lg: 8px;   /* Large elements, cards */
  --radius-full: 20px; /* Pills, badges */
}
```

---

## Shadow Tokens

```css
:root {
  /* Dark theme - minimal shadows */
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-glow-green: 0 0 8px var(--green);
  --shadow-glow-purple: 0 0 8px var(--purple);
}

body.theme-light {
  --shadow-sm: 0 1px 3px rgba(40, 42, 54, 0.08);
  --shadow-md: 0 2px 6px rgba(40, 42, 54, 0.08);
  --shadow-glow-green: 0 0 8px rgba(46, 204, 113, 0.5);
  --shadow-glow-purple: 0 2px 4px rgba(155, 109, 255, 0.3);
}
```

---

## Transition Tokens

```css
:root {
  --transition-fast: all 0.15s ease;
  --transition-normal: all 0.3s ease;
}
```

### Usage

| Token | Applied To |
|-------|------------|
| `--transition-fast` | Buttons, hover states, interactive elements |
| `--transition-normal` | Page transitions, modal animations |

---

## Z-Index Scale

```css
:root {
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
}
```

### Z-Index Usage

| Token | Value | Use Cases |
|-------|-------|-----------|
| `--z-base` | 1 | Base level elements |
| `--z-dropdown` | 100 | Dropdown menus, select boxes |
| `--z-sticky` | 200 | Sticky headers, navbars |
| `--z-fixed` | 300 | Fixed position elements |
| `--z-modal-backdrop` | 400 | Modal overlay backgrounds |
| `--z-modal` | 500 | Modal dialogs |
| `--z-popover` | 600 | Popovers, floating panels |
| `--z-tooltip` | 700 | Tooltips (highest) |

---

## Breakpoint Tokens

For responsive design implementation:

```css
:root {
  --breakpoint-mobile: 480px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-wide: 1400px;
}
```

### Media Query Usage

```css
/* Mobile first approach */
@media (max-width: 480px) { /* Mobile */ }
@media (max-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1400px) { /* Wide screens */ }
```

---

## Component-Specific Tokens

### Scrollbar

```css
:root {
  --scrollbar-width: 8px;
  --scrollbar-track: var(--bg-secondary);
  --scrollbar-thumb: var(--bg-highlight);
  --scrollbar-thumb-hover: var(--comment);
}

body.theme-light {
  --scrollbar-thumb: var(--border);
}
```

### Stack Marker

```css
:root {
  --marker-size: 10px;
  --marker-inactive: var(--comment);
  --marker-active: var(--green);
}
```

### Section Badge

```css
:root {
  --badge-min-width: 22px;
  --badge-height: 22px;
  --badge-padding: 0 7px;
  --badge-bg: var(--bg-highlight);
  --badge-color: var(--comment);
  --badge-radius: 11px;
}
```

### Panel

```css
:root {
  --panel-min-width: 300px;
}
```

---

## Implementation Example

### Using Design Tokens

```css
/* GOOD - Using tokens */
.custom-panel {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  color: var(--foreground);
  transition: var(--transition-fast);
}

.custom-panel:hover {
  background: var(--bg-highlight);
}

/* BAD - Hardcoded values */
.custom-panel {
  background: #282a36;
  border: 1px solid #44475a;
  border-radius: 6px;
  padding: 16px;
  color: #f8f8f2;
  transition: all 0.15s;
}
```

---

## Token Naming Convention

The design system follows this naming pattern:

```
--{category}-{variant}-{state}
```

**Examples:**
- `--bg-secondary` (category: bg, variant: secondary)
- `--font-size-xs` (category: font-size, variant: xs)
- `--shadow-md` (category: shadow, variant: md)
- `--scrollbar-thumb-hover` (category: scrollbar, variant: thumb, state: hover)

---

## Extending the Token System

When adding new tokens:

1. **Follow the naming convention** consistently
2. **Document the token** in this file with purpose and usage
3. **Provide both theme values** (dark and light) if color-related
4. **Use semantic names** (e.g., `--bg-highlight` not `--gray-300`)
5. **Consider contrast ratios** for accessibility (WCAG AA minimum)

---

## Token Reference Table

### Quick Lookup - Colors

| CSS Variable | Dark Value | Light Value | Purpose |
|--------------|-----------|-------------|---------|
| `--bg` | #282a36 | #f8f8f2 | Primary background |
| `--bg-secondary` | #21222c | #f1f1f0 | Headers, toolbars |
| `--bg-highlight` | #44475a | #e8e8e4 | Hover states |
| `--bg-editor` | #282a36 | #f8f8f2 | Code editor background |
| `--bg-active` | #44475a | #e8e8e4 | Active state |
| `--bg-hover` | #44475a | #e8e8e4 | Hover state |
| `--foreground` | #f8f8f2 | #282a36 | Primary text |
| `--text-primary` | #f8f8f2 | #282a36 | Primary text (alias) |
| `--text-secondary` | #6272a4 | #7c8db5 | Secondary text |
| `--text-tertiary` | #6272a4 | #7c8db5 | Tertiary text |
| `--text-disabled` | #44475a | #d6d6d0 | Disabled text |
| `--comment` | #6272a4 | #7c8db5 | Secondary text |
| `--border` | #44475a | #d6d6d0 | Standard border |
| `--border-subtle` | #44475a | #d6d6d0 | Subtle border |
| `--border-medium` | #6272a4 | #7c8db5 | Medium border |
| `--cyan` | #8be9fd | #0fb9d2 | Types, interfaces |
| `--green` | #50fa7b | #2ecc71 | Success, active |
| `--orange` | #ffb86c | #e6a050 | Emphasis |
| `--pink` | #ff79c6 | #e06ba8 | Keywords |
| `--purple` | #bd93f9 | #9b6dff | Brand, values |
| `--red` | #ff5555 | #e04545 | Errors |
| `--yellow` | #f1fa8c | #d4b830 | Warnings, strings |

### Quick Lookup - Sizing

| CSS Variable | Value | Purpose |
|--------------|-------|---------|
| `--spacing-xs` | 4px | Tight gaps |
| `--spacing-sm` | 8px | Small gaps |
| `--spacing-md` | 12px | Standard padding |
| `--spacing-lg` | 16px | Large padding |
| `--spacing-xl` | 20px | Extra large |
| `--spacing-xxl` | 24px | Section spacing |
| `--radius-sm` | 4px | Small radius |
| `--radius-md` | 6px | Standard radius |
| `--radius-lg` | 8px | Large radius |
| `--font-size-xs` | 12px | Small text |
| `--font-size-sm` | 13px | Secondary text |
| `--font-size-md` | 14px | Body text |
| `--font-size-lg` | 15px | Emphasized |
| `--font-size-xl` | 16px | Headings |

---

## Version History

- **v1.1** (2024): Extended token system
  - Added semantic text tokens (`--text-primary`, etc.)
  - Added semantic border tokens (`--border-subtle`, `--border-medium`)
  - Added semantic accent tokens (`--accent-*`)
  - Added syntax highlighting tokens (`--syntax-*`)
  - Added step type colors for debug visualizer
  - Added shadow tokens for both themes
  - Aligned font sizes to px units
  - Added full z-index scale
- **v1.0** (2024): Initial token system
  - Extracted from TS Type Debugger HTML mockups
  - Dracula theme color scheme

---

## Related Documentation

- [Complete Design Guidelines](design-guidelines-complete.md)
- [Interactive Style Guide](reference-styleguide-complete.html)
- [Component Documentation](SKILL.md)
