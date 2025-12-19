import type { TraceEntry } from "../../src/astGenerator.ts";

/**
 * Find trace entry by type
 */
export function findTraceByType(
  trace: Array<TraceEntry>,
  type: TraceEntry["type"]
): TraceEntry | undefined {
  return trace.find(t => t.type === type);
}

/**
 * Filter trace entries by type
 */
function filterTracesByType(
  trace: Array<TraceEntry>,
  type: TraceEntry["type"]
): Array<TraceEntry> {
  return trace.filter(t => t.type === type);
}

/**
 * Count occurrences of trace type
 */
export function countTraceType(
  trace: Array<TraceEntry>,
  type: TraceEntry["type"]
): number {
  return filterTracesByType(trace, type).length;
}
