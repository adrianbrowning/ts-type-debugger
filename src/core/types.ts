/**
 * Shared type definitions for CLI and web app
 */

import type { TraceEntry } from '../astGenerator.ts';

/**
 * Type info for display including relevant source code
 */
export type TypeInfo = {
  name: string;
  text: string;
  lines: string[];
  startLine: number;
  endLine: number;
  highlightedLines?: string[]; // HTML strings with syntax highlighting
}

/**
 * Enhanced trace entry with timing and visual data
 */
export type VideoTraceStep = {
  original: TraceEntry;
  stepIndex: number;
  startFrame: number;
  duration: number; // in frames
  endFrame: number;
  color: string;
  isHighlight: boolean; // has source location
  highlightLines?: {
    start: number;
    end: number;
    chars?: { start: number; end: number };
  };
}

/**
 * Complete video data structure
 */
export type VideoData = {
  totalFrames: number;
  fps: number;
  steps: VideoTraceStep[];
  typeAliases: TypeInfo[];
  sourceCode: string;
  activeTypeMap: Map<number, TypeInfo | null> | Record<number, TypeInfo | null>;
}

/**
 * Configuration for video generation
 */
export type VideoConfig = {
  fps: number; // frames per second
  secondsPerStep: number; // duration for each step
}

/**
 * Color scheme for different trace types
 */
export const TRACE_TYPE_COLORS: Record<TraceEntry['type'], string> = {
  type_alias_start: '#94A3B8', // slate
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
  mapped_type_result: '#10B981', // green
  mapped_type_end: '#8B5CF6', // purple
  indexed_access: '#06B6D4', // cyan
  indexed_access_result: '#10B981', // green
};
