/**
 * Layout and styling configuration for web app
 */

export const LAYOUT = {
  width: 1920,
  height: 1080,
  padding: 20,

  // Two column layout
  leftPanel: {
    width: 950,
    x: 20,
  },
  rightPanel: {
    width: 930,
    x: 970,
  },

  // Code styling
  code: {
    fontSize: 14,
    lineHeight: 1.6,
    fontFamily: '"Fira Code", "Monaco", monospace',
    padding: 15,
  },

  // Results panel styling
  results: {
    fontSize: 13,
    padding: 15,
  },

  // Highlight styling
  highlight: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 4,
  },
};

/**
 * Color palette
 */
export const COLORS = {
  background: '#1E293B',
  surface: '#0F172A',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#334155',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

/**
 * Color scheme for different trace types
 */
export const TRACE_TYPE_COLORS: Record<string, string> = {
  type_alias_result: '#10B981', // green
  generic_call: '#3B82F6', // blue
  generic_def: '#8B5CF6', // purple
  generic_result: '#10B981', // green
  condition: '#F59E0B', // amber
  conditional_evaluate_left: '#EC4899', // pink
  conditional_evaluate_right: '#EC4899', // pink
  conditional_evaluation: '#F59E0B', // amber
  branch_true: '#10B981', // green
  branch_false: '#EF4444', // red
  template_literal: '#06B6D4', // cyan
  alias_reference: '#6366F1', // indigo
  substitution: '#14B8A6', // teal
  mapped_type_start: '#8B5CF6', // purple
  mapped_type_constraint: '#F59E0B', // amber
  mapped_type_constraint_result: '#F59E0B', // amber
  map_iteration: '#3B82F6', // blue
  map_iteration_result: '#10B981', // green
  mapped_type_result: '#10B981', // green
  indexed_access: '#06B6D4', // cyan
  indexed_access_result: '#10B981', // green
  type_alias_start: '#94A3B8', // slate
};
