/**
 * Color theme based on img.png design (GitHub Dark-inspired)
 */

export const THEME = {
  // Backgrounds
  bg: {
    primary: '#0d1117',      // Main background
    secondary: '#161b22',    // Panel backgrounds
    editor: '#1e2128',       // Code editor
    active: '#1f3a5f',       // Active elements
    hover: '#262c36',        // Hover states
  },

  // Text colors
  text: {
    primary: '#ffffff',      // White text
    secondary: '#8b949e',    // Muted gray
    tertiary: '#6e7681',     // Darker gray
    disabled: '#4a5568',     // Disabled/inactive
  },

  // Accent colors
  accent: {
    primary: '#22c55e',      // Green (primary action)
    primaryAlt: '#10b981',   // Alternative green
    highlight: '#3b82f6',    // Blue (highlights)
    warning: '#f59e0b',      // Amber
    success: '#10b981',      // Green
    error: '#ef4444',        // Red
  },

  // Borders
  border: {
    subtle: '#30363d',       // Dark gray borders
    medium: '#444c56',       // Medium borders
  },

  // Syntax highlighting (VS Code dark theme)
  syntax: {
    keyword: '#569cd6',      // Blue
    type: '#4ec9b0',         // Cyan/Teal
    string: '#ce9178',       // Orange/Salmon
    number: '#b5cea8',       // Light green
    comment: '#6a9955',      // Green
    punctuation: '#d4d4d4',  // Light gray
  },

  // Step type colors
  stepType: {
    type_alias_result: '#10b981',
    generic_call: '#3b82f6',
    generic_def: '#8b5cf6',
    generic_result: '#10b981',
    condition: '#f59e0b',
    conditional_evaluate_left: '#ec4899',
    conditional_evaluate_right: '#ec4899',
    conditional_evaluation: '#f59e0b',
    branch_true: '#10b981',
    branch_false: '#ef4444',
    template_literal: '#06b6d4',
    alias_reference: '#6366f1',
    substitution: '#14b8a6',
    mapped_type_start: '#8b5cf6',
    mapped_type_constraint: '#f59e0b',
    mapped_type_constraint_result: '#f59e0b',
    map_iteration: '#3b82f6',
    map_iteration_result: '#10b981',
    mapped_type_result: '#10b981',
    indexed_access: '#06b6d4',
    indexed_access_result: '#10b981',
    type_alias_start: '#94a3b8',
  },

  // Sizing
  size: {
    panelMinWidth: 300,
    editorWidth: '35%',
    typeDefWidth: '35%',
    stepDetailsWidth: '30%',
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },

  // Font sizes
  fontSize: {
    xs: '12px',
    sm: '13px',
    md: '14px',
    lg: '15px',
    xl: '16px',
    '2xl': '18px',
    '3xl': '24px',
    '4xl': '28px',
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
} as const;
