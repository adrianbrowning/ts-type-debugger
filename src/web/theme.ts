/**
 * Returns CSS variable reference string
 * Browser resolves the actual value at paint time (after class is applied)
 * This eliminates the race condition between React render and DOM class updates
 */
const cssVar = (name: string): string => `var(${name})`;

/**
 * Creates theme object by reading CSS variables
 * Call this to get current theme values from CSS custom properties
 */
export const createTheme = () => ({
  // Backgrounds
  bg: {
    primary: cssVar("--bg"),
    secondary: cssVar("--bg-secondary"),
    editor: cssVar("--bg-editor"),
    active: cssVar("--bg-active"),
    hover: cssVar("--bg-hover"),
  },

  // Text colors
  text: {
    primary: cssVar("--text-primary"),
    secondary: cssVar("--text-secondary"),
    tertiary: cssVar("--text-tertiary"),
    disabled: cssVar("--text-disabled"),
  },

  // Accent colors
  accent: {
    primary: cssVar("--accent-primary"),
    primaryAlt: cssVar("--accent-primary-alt"),
    highlight: cssVar("--accent-highlight"),
    warning: cssVar("--accent-warning"),
    success: cssVar("--accent-success"),
    error: cssVar("--accent-error"),
    btnText: cssVar("--btn-accent-text"),
  },

  // Borders
  border: {
    subtle: cssVar("--border-subtle"),
    medium: cssVar("--border-medium"),
  },

  // Syntax highlighting
  syntax: {
    keyword: cssVar("--syntax-keyword"),
    type: cssVar("--syntax-type"),
    string: cssVar("--syntax-string"),
    number: cssVar("--syntax-number"),
    comment: cssVar("--syntax-comment"),
    punctuation: cssVar("--syntax-punctuation"),
  },

  // Step type colors
  stepType: {
    generic_call: cssVar("--step-generic-call"),
    generic_def: cssVar("--step-generic-def"),
    generic_result: cssVar("--step-generic-result"),
    condition: cssVar("--step-condition"),
    conditional_evaluate_left: cssVar("--step-conditional-evaluate-left"),
    conditional_evaluate_right: cssVar("--step-conditional-evaluate-right"),
    conditional_evaluation: cssVar("--step-conditional-evaluation"),
    branch_true: cssVar("--step-branch-true"),
    branch_false: cssVar("--step-branch-false"),
    template_literal: cssVar("--step-template-literal"),
    alias_reference: cssVar("--step-alias-reference"),
    substitution: cssVar("--step-substitution"),
    mapped_type_start: cssVar("--step-mapped-type-start"),
    mapped_type_constraint: cssVar("--step-mapped-type-constraint"),
    mapped_type_constraint_result: cssVar("--step-mapped-type-constraint-result"),
    map_iteration: cssVar("--step-map-iteration"),
    mapped_type_result: cssVar("--step-mapped-type-result"),
    mapped_type_end: cssVar("--step-mapped-type-end"),
    indexed_access: cssVar("--step-indexed-access"),
    indexed_access_result: cssVar("--step-indexed-access-result"),
    type_alias_start: cssVar("--step-type-alias-start"),
  },

  // Sizing
  size: {
    panelMinWidth: 300,
    editorWidth: "35%",
    typeDefWidth: "35%",
    stepDetailsWidth: "30%",
  },

  // Border radius
  radius: {
    sm: cssVar("--radius-sm") || "4px",
    md: cssVar("--radius-md") || "6px",
    lg: cssVar("--radius-lg") || "8px",
  },

  // Spacing
  spacing: {
    xs: cssVar("--spacing-xs") || "4px",
    sm: cssVar("--spacing-sm") || "8px",
    md: cssVar("--spacing-md") || "12px",
    lg: cssVar("--spacing-lg") || "16px",
    xl: cssVar("--spacing-xl") || "20px",
    xxl: cssVar("--spacing-xxl") || "24px",
  },

  // Font sizes
  fontSize: {
    xs: cssVar("--font-size-xs") || "12px",
    sm: cssVar("--font-size-sm") || "13px",
    md: cssVar("--font-size-md") || "14px",
    lg: cssVar("--font-size-lg") || "15px",
    xl: cssVar("--font-size-xl") || "16px",
    "2xl": cssVar("--font-size-2xl") || "18px",
    "3xl": cssVar("--font-size-3xl") || "24px",
    "4xl": cssVar("--font-size-4xl") || "28px",
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Z-index
  zIndex: {
    dropdown: 100,
    modal: 1000,
    tooltip: 1100,
  },

  // Raw numeric values for JS calculations (not CSS variables)
  raw: {
    fontSizeMd: 14,
    lineHeight: 1.6,
  },
});

/**
 * Theme type for TypeScript
 */
export type Theme = ReturnType<typeof createTheme>;

/**
 * Global theme object with CSS variable references
 * CSS variables resolve at paint time - no hook needed
 */
export const GLOBAL_THEME = createTheme();
